import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, PDFDocument, SuggestedQuestion, QuickAction } from '../types';
import {
  generateChatResponse,
  generateSummary,
  generateKeyInsights,
  generateTopics,
  generateStudyNotes,
  generateSuggestedQuestions
} from '../services/geminiService';
import { generateId } from '../utils/helpers';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  suggestedQuestions: SuggestedQuestion[];
  sendMessage: (content: string) => Promise<void>;
  handleQuickAction: (action: QuickAction) => Promise<void>;
  clearChat: () => void;
  loadSuggestions: (document: PDFDocument) => Promise<void>;
}

export function useChat(apiKey: string | null, document: PDFDocument | null): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const activeRequestRef = useRef<Promise<void> | null>(null);
  const documentChangeIdRef = useRef<string | null>(null);

  // Clear messages and suggestions when document changes
  useEffect(() => {
    const currentDocId = document?.id || null;
    if (documentChangeIdRef.current !== currentDocId) {
      documentChangeIdRef.current = currentDocId;
      setMessages([]);
      setSuggestedQuestions([]);
      setError(null);
    }
  }, [document?.id]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, sources?: Message['sources']) => {
    const newMessage: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
      sources
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!document || !content.trim()) return;

    if (!apiKey) {
      setError('Please configure your Gemini API key in Settings');
      return;
    }

    // Check for active request
    if (activeRequestRef.current) {
      setError('Please wait for the current request to complete');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message
    addMessage('user', content.trim());

    // Add typing indicator
    const typingId = addMessage('assistant', '', undefined);
    updateMessage(typingId, { isTyping: true });

    try {
      const requestPromise = generateChatResponse(
        apiKey,
        document,
        content,
        messages
      );
      activeRequestRef.current = requestPromise.then(() => {});

      const { content: response, sources } = await requestPromise;

      updateMessage(typingId, {
        content: response,
        sources,
        isTyping: false
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      updateMessage(typingId, {
        content: `Error: ${errorMessage}`,
        isTyping: false
      });
    } finally {
      setIsLoading(false);
      activeRequestRef.current = null;
    }
  }, [apiKey, document, messages, addMessage, updateMessage]);

  const handleQuickAction = useCallback(async (action: QuickAction) => {
    if (!document) return;

    if (!apiKey) {
      setError('Please configure your Gemini API key in Settings');
      return;
    }

    // Check for active request
    if (activeRequestRef.current) {
      setError('Please wait for the current request to complete');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message showing what action
    const actionLabels: Record<QuickAction, string> = {
      summarize: 'Summarize Document',
      insights: 'Key Insights',
      topics: 'Extract Topics',
      study: 'Generate Study Notes'
    };

    const actionHandlers: Record<QuickAction, (key: string, doc: PDFDocument) => Promise<string>> = {
      summarize: generateSummary,
      insights: generateKeyInsights,
      topics: generateTopics,
      study: generateStudyNotes
    };

    addMessage('user', actionLabels[action]);
    const typingId = addMessage('assistant', '', undefined);
    updateMessage(typingId, { isTyping: true });

    try {
      const requestPromise = actionHandlers[action](apiKey, document);
      activeRequestRef.current = requestPromise.then(() => {});

      const response = await requestPromise;
      updateMessage(typingId, {
        content: response,
        isTyping: false
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process request';
      setError(errorMessage);
      updateMessage(typingId, {
        content: `Error: ${errorMessage}`,
        isTyping: false
      });
    } finally {
      setIsLoading(false);
      activeRequestRef.current = null;
    }
  }, [apiKey, document, addMessage, updateMessage]);

  const clearChat = useCallback(() => {
    // Only clear if no active request
    if (activeRequestRef.current) return;
    setMessages([]);
    setError(null);
  }, []);

  const loadSuggestions = useCallback(async (doc: PDFDocument) => {
    if (!apiKey) return;

    try {
      const questions = await generateSuggestedQuestions(apiKey, doc);
      setSuggestedQuestions(questions);
    } catch {
      // Keep empty suggestions on error
    }
  }, [apiKey]);

  return {
    messages,
    isLoading,
    error,
    suggestedQuestions,
    sendMessage,
    handleQuickAction,
    clearChat,
    loadSuggestions
  };
}
