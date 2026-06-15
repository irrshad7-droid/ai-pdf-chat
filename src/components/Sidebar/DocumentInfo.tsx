import { useState } from 'react';
import { FileText, Hash, Clock, AlertCircle, CheckCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { PDFDocument } from '../../types';
import { formatFileSize } from '../../utils/helpers';
import { estimateReadingTime, getPreviewText } from '../../services/pdfService';
import Card, { CardHeader } from '../UI/Card';
import { cn } from '../../utils/cn';

interface DocumentInfoProps {
  document: PDFDocument;
}

export function DocumentInfo({ document }: DocumentInfoProps) {
  const [showPreview, setShowPreview] = useState(false);
  const previewText = getPreviewText(document, 500);
  const hasNoText = document.wordCount === 0;

  const statusColors = {
    uploading: 'text-yellow-400',
    processing: 'text-blue-400',
    ready: 'text-green-400',
    error: 'text-red-400'
  };

  const statusIcons = {
    uploading: Clock,
    processing: Clock,
    ready: CheckCircle,
    error: AlertCircle
  };

  const StatusIcon = statusIcons[document.status];

  return (
    <Card className="animate-slide-in-left">
      <CardHeader>
        <FileText className="w-5 h-5 text-primary-400" />
        <h3 className="text-sm font-medium text-white truncate">{document.name}</h3>
      </CardHeader>

      <div className="pt-3 space-y-3">
        {/* Warning if no text extracted */}
        {hasNoText && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-400">
              <p className="font-medium">No text extracted</p>
              <p className="mt-1 text-yellow-400/80">
                This PDF may contain scanned images or images with text. Text extraction works best with text-based PDFs.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Status</span>
          <span className={cn('flex items-center gap-1.5', statusColors[document.status])}>
            <StatusIcon className="w-4 h-4" />
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-primary-400" />
              <span className="text-xs text-dark-400">Pages</span>
            </div>
            <p className="text-xl font-semibold text-white">{document.totalPages}</p>
          </div>

          <div className="bg-dark-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-primary-400" />
              <span className="text-xs text-dark-400">Words</span>
            </div>
            <p className={cn(
              "text-xl font-semibold",
              hasNoText ? "text-yellow-400" : "text-white"
            )}>
              {document.wordCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">File Size</span>
            <span className="text-white">{formatFileSize(document.size)}</span>
          </div>

          {!hasNoText && (
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Est. Read Time</span>
              <span className="text-white">
                {estimateReadingTime(document.wordCount)} min
              </span>
            </div>
          )}
        </div>

        {/* Debug preview toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between text-sm text-dark-400 hover:text-white transition-colors py-2"
        >
          <span>Show extracted text preview</span>
          {showPreview ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showPreview && (
          <div className="bg-dark-800 rounded-lg p-3 animate-slide-up">
            <p className="text-xs text-dark-400 mb-2">First 500 characters:</p>
            <p className="text-xs text-dark-300 font-mono leading-relaxed break-words">
              {previewText || <span className="text-yellow-400">No text extracted</span>}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
