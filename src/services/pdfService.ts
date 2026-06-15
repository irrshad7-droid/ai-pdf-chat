import * as pdfjsLib from 'pdfjs-dist';
import type { ExtractedPage, PDFDocument } from '../types';
import { generateId, countWords, validatePDFFile } from '../utils/helpers';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<PDFDocument> {
  // Validate file
  const validation = validatePDFFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const documentId = generateId();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: ExtractedPage[] = [];
    let totalWordCount = 0;
    let allExtractedText: string[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text items - improved extraction
      const textItems: string[] = [];
      for (const item of textContent.items) {
        if ('str' in item && item.str) {
          textItems.push(item.str);
        }
      }

      // Join with spaces, but preserve some structure
      const pageText = textItems.join(' ').trim();
      const wordCount = countWords(pageText);

      pages.push({
        pageNumber: pageNum,
        text: pageText,
        wordCount
      });

      totalWordCount += wordCount;
      allExtractedText.push(`[Page ${pageNum}] ${pageText}`);
    }

    // Debug logging
    console.log(`[PDF Extraction] Total pages: ${pdf.numPages}`);
    console.log(`[PDF Extraction] Total words extracted: ${totalWordCount}`);
    console.log(`[PDF Extraction] First 500 chars:`, allExtractedText.join(' ').substring(0, 500));

    // If no text extracted, try to provide helpful info
    if (totalWordCount === 0) {
      console.warn('[PDF Extraction] No text found - PDF may be scanned/image-based');
    }

    return {
      id: documentId,
      name: file.name,
      size: file.size,
      totalPages: pdf.numPages,
      wordCount: totalWordCount,
      content: pages,
      status: 'ready',
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('[PDF Extraction] Error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
    throw new Error('Failed to process PDF: Unknown error');
  }
}

export function getDocumentContext(
  document: PDFDocument,
  pageNumber?: number
): string {
  if (pageNumber && pageNumber > 0 && pageNumber <= document.totalPages) {
    const page = document.content.find(p => p.pageNumber === pageNumber);
    return page?.text || '';
  }

  // Return all text
  return document.content.map(p => `[Page ${p.pageNumber}]\n${p.text}`).join('\n\n');
}

export function estimateReadingTime(wordCount: number): number {
  // Average reading speed: 200-250 words per minute
  return Math.ceil(wordCount / 225);
}

// Get preview text for debugging
export function getPreviewText(document: PDFDocument, maxLength: number = 500): string {
  const allText = document.content.map(p => p.text).join(' ');
  return allText.substring(0, maxLength) + (allText.length > maxLength ? '...' : '');
}
