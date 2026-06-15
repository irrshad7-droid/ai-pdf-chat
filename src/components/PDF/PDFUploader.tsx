import { X } from 'lucide-react';
import { PDFDropzone } from './PDFDropzone';
import Card from '../UI/Card';
import { cn } from '../../utils/cn';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  progress?: number;
  error?: string | null;
  show?: boolean;
  onClose?: () => void;
}

export function PDFUploader({
  onFileSelect,
  isLoading,
  progress,
  error,
  show = true,
  onClose
}: PDFUploaderProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
      <Card
        variant="bordered"
        className={cn(
          'w-full max-w-lg',
          'animate-slide-up'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <h3 className="text-lg font-semibold text-white">Upload PDF</h3>
          {onClose && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1 text-dark-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <PDFDropzone
            onFileSelect={onFileSelect}
            isLoading={isLoading}
            progress={progress}
            error={error}
          />
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-dark-500">
            Your PDF is processed locally in your browser
          </p>
        </div>
      </Card>
    </div>
  );
}
