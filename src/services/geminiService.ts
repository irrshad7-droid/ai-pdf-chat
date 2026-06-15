import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message, PDFDocument, SourceReference, SuggestedQuestion } from '../types';
import { generateId, extractRelevantPages } from '../utils/helpers';

// Maximum characters to send to Gemini (staying well under token limits)
const MAX_CONTEXT_CHARS = 8000;

// Rate limiting settings
const MIN_COOLDOWN_MS = 5000; // 5 seconds between requests
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000; // Start with 2 seconds for exponential backoff

// Request state tracking
let lastRequestTime = 0;
let isRequestInProgress = false;
let requestCount = 0;
let apiCallCount = 0;

// Get the Gemini API client with provided key
const getGenAI = (apiKey: string) => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is not configured. Please add your API key in Settings.');
  }
  return new GoogleGenerativeAI(apiKey.trim());
};

// Helper to truncate text to max length
const truncateContext = (text: string, maxLength: number = MAX_CONTEXT_CHARS): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '\n\n[Content truncated due to size limits...]';
};

// Wait for specified milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check cooldown and wait if needed
const waitForCooldown = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const remainingCooldown = MIN_COOLDOWN_MS - timeSinceLastRequest;

  if (remainingCooldown > 0) {
    console.log(`[Gemini Rate Limit] Waiting ${Math.ceil(remainingCooldown / 1000)}s for cooldown...`);
    await sleep(remainingCooldown);
  }
};

// Parse error and determine retry delay
const parseRetryDelay = (error: unknown): number | null => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for 429 or rate limit errors
    if (message.includes('429') || message.includes('quota') || message.includes('rate limit')) {
      // Try to extract retry delay from error message
      const retryMatch = message.match(/retry.?(\d+)/i) || message.match(/(\d+)\s*(second|minute)/i);
      if (retryMatch) {
        const delay = parseInt(retryMatch[1], 10);
        // Convert to milliseconds if in seconds/minutes
        if (message.includes('second')) return delay * 1000;
        if (message.includes('minute')) return delay * 60000;
        return delay * 1000; // Assume seconds by default
      }

      // Default backoff
      return BASE_RETRY_DELAY_MS;
    }
  }
  return null;
};

// Format error for user display
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('429') || message.includes('quota') || message.includes('rate limit')) {
      return 'API rate limit reached. Please wait a minute before trying again. Gemini\'s free tier has request limits.';
    }

    if (message.includes('api key') || message.includes('invalid') || message.includes('401')) {
      return 'Invalid API key. Please check your Gemini API key in Settings.';
    }

    // Remove raw error codes and return clean message
    return error.message.replace(/\[\d+\]/g, '').trim() || 'An error occurred. Please try again.';
  }
  return 'An unexpected error occurred. Please try again.';
};

// Export for use in error handling
export { formatError };

// Execute request with cooldown, retry, and deduplication
const executeWithRateLimit = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  // Prevent duplicate requests
  if (isRequestInProgress) {
    throw new Error('A request is already in progress. Please wait for it to complete.');
  }

  isRequestInProgress = true;
  requestCount++;
  const currentRequest = requestCount;

  console.log(`[Gemini API] Request #${currentRequest}: ${operationName}`);

  try {
    // Wait for cooldown
    await waitForCooldown();

    let lastError: unknown;
    let retryDelay = BASE_RETRY_DELAY_MS;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        lastRequestTime = Date.now();
        apiCallCount++;
        console.log(`[Gemini API] API call #${apiCallCount} (request #${currentRequest}, attempt ${attempt + 1}/${MAX_RETRIES})`);

        const result = await operation();
        console.log(`[Gemini API] Request #${currentRequest} completed successfully`);
        return result;
      } catch (error) {
        lastError = error;

        const retryAfter = parseRetryDelay(error);
        if (retryAfter !== null) {
          const actualDelay = attempt > 0 ? retryDelay : retryAfter;
          console.log(`[Gemini API] Rate limited. Waiting ${Math.ceil(actualDelay / 1000)}s before retry ${attempt + 2}/${MAX_RETRIES}...`);

          // Exponential backoff for subsequent retries
          retryDelay = Math.min(retryDelay * 2, 60000); // Cap at 60 seconds

          await sleep(actualDelay);
        } else {
          // Non-rate-limit error, don't retry
          throw error;
        }
      }
    }

    // All retries exhausted
    throw lastError;
  } finally {
    isRequestInProgress = false;
  }
};

// Check if a request can be made (for UI state)
export const canMakeRequest = (): boolean => {
  return !isRequestInProgress;
};

// Get time until next request is allowed
export const getTimeUntilNextRequest = (): number => {
  if (!isRequestInProgress) return 0;
  const elapsed = Date.now() - lastRequestTime;
  return Math.max(0, MIN_COOLDOWN_MS - elapsed);
};

const SYSTEM_INSTRUCTION = `You are an intelligent PDF document assistant. Your role is to answer questions based ONLY on the content of the uploaded PDF document.

Important rules:
1. ONLY use information from the provided document context
2. If the answer cannot be found in the document, clearly state: "I couldn't find that information in the document."
3. When referencing content, always mention the page number(s) where the information was found
4. Be precise and thorough in your responses
5. If a user asks something not related to the document, politely redirect them to ask about the document content
6. Format your responses clearly with bullet points or numbered lists when appropriate`;

export async function generateChatResponse(
  apiKey: string,
  document: PDFDocument,
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ content: string; sources: SourceReference[] }> {
  return executeWithRateLimit(async () => {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Find relevant pages based on the query
    const relevantPages = extractRelevantPages(
      userMessage,
      document.content,
      5
    );

    // Build context from relevant pages only
    let documentContext: string;
    if (relevantPages.length > 0) {
      documentContext = relevantPages
        .map(p => `[Page ${p.pageNumber}]\n${p.text}`)
        .join('\n\n');
    } else {
      documentContext = document.content
        .slice(0, 3)
        .map(p => `[Page ${p.pageNumber}]\n${p.text}`)
        .join('\n\n');
    }

    documentContext = truncateContext(documentContext, MAX_CONTEXT_CHARS);
    console.log(`[Gemini API] Sending ${documentContext.length} characters for chat query`);

    const recentHistory = conversationHistory
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-4)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 200)}`)
      .join('\n');

    const prompt = `Document Content:
${documentContext}

${recentHistory ? `Recent Conversation:\n${recentHistory}\n\n` : ''}
Current Question: ${userMessage}

Please answer based only on the document content. Include page numbers for references.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const sources: SourceReference[] = (relevantPages.length > 0 ? relevantPages : document.content.slice(0, 3))
      .slice(0, 3)
      .map(page => ({
        pageNumber: page.pageNumber,
        excerpt: page.text.substring(0, 100) + (page.text.length > 100 ? '...' : '')
      }));

    return { content: text, sources };
  }, `Chat: "${userMessage.substring(0, 30)}..."`);
}

export async function generateSuggestedQuestions(
  apiKey: string,
  document: PDFDocument
): Promise<SuggestedQuestion[]> {
  return executeWithRateLimit(async () => {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const previewContent = document.content
      .slice(0, 2)
      .map(p => `[Page ${p.pageNumber}]\n${p.text}`)
      .join('\n\n');

    const truncatedPreview = truncateContext(previewContent, 3000);
    console.log(`[Gemini API] Sending ${truncatedPreview.length} characters for suggestions`);

    const prompt = `Based on this document preview, suggest 3 questions a reader might ask. Return ONLY the questions, numbered 1-3.

Document Preview:
${truncatedPreview}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const questions = text
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map((line) => ({
        id: generateId(),
        question: line.replace(/^\d+\.\s*/, '').trim(),
        category: 'general' as const
      }));

    return questions.slice(0, 3);
  }, 'Generate suggestions');
}

export async function generateSummary(apiKey: string, document: PDFDocument): Promise<string> {
  return executeWithRateLimit(async () => {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const content = document.content.slice(0, 5).map(p => p.text).join('\n\n');
    const truncatedContent = truncateContext(content, MAX_CONTEXT_CHARS);
    console.log(`[Gemini API] Sending ${truncatedContent.length} characters for summary`);

    const prompt = `Summarize this document:
- Main topic
- Key points (bullet points)
- Important conclusions

Document:
${truncatedContent}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }, 'Generate summary');
}

export async function generateKeyInsights(apiKey: string, document: PDFDocument): Promise<string> {
  return executeWithRateLimit(async () => {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const content = document.content.slice(0, 5).map(p => p.text).join('\n\n');
    const truncatedContent = truncateContext(content, MAX_CONTEXT_CHARS);
    console.log(`[Gemini API] Sending ${truncatedContent.length} characters for insights`);

    const prompt = `Extract key insights:
- Unique findings
- Important data/statistics
- Key recommendations

Document:
${truncatedContent}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }, 'Generate insights');
}

export async function generateTopics(apiKey: string, document: PDFDocument): Promise<string> {
  return executeWithRateLimit(async () => {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const content = document.content.slice(0, 5).map(p => p.text).join('\n\n');
    const truncatedContent = truncateContext(content, MAX_CONTEXT_CHARS);
    console.log(`[Gemini API] Sending ${truncatedContent.length} characters for topics`);

    const prompt = `List main topics in this document with page references:

Document:
${truncatedContent}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }, 'Generate topics');
}

export async function generateStudyNotes(apiKey: string, document: PDFDocument): Promise<string> {
  return executeWithRateLimit(async () => {
    const genAI = getGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const content = document.content.slice(0, 5).map(p => p.text).join('\n\n');
    const truncatedContent = truncateContext(content, MAX_CONTEXT_CHARS);
    console.log(`[Gemini API] Sending ${truncatedContent.length} characters for study notes`);

    const prompt = `Create study notes:
## Overview
## Key Concepts
## Important Terms
## Summary

Document:
${truncatedContent}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }, 'Generate study notes');
}
