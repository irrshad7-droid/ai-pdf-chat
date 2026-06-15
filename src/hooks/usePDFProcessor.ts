import { useState, useCallback } from 'react';
import type { PDFDocument } from '../types';
import { extractTextFromPDF } from '../services/pdfService';

interface UsePDFProcessorReturn {
  document: PDFDocument | null;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  processPDF: (file: File) => Promise<void>;
  clearDocument: () => void;
}

export function usePDFProcessor(): UsePDFProcessorReturn {
  const [document, setDocument] = useState<PDFDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processPDF = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress updates for better UX
      setProgress(10);

      const processedDoc = await extractTextFromPDF(file);

      setProgress(100);
      setDocument(processedDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearDocument = useCallback(() => {
    setDocument(null);
    setProgress(0);
    setError(null);
  }, []);

  return {
    document,
    isProcessing,
    progress,
    error,
    processPDF,
    clearDocument
  };
}
