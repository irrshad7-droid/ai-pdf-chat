import { useState, useCallback, useRef } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { validatePDFFile } from '../../utils/helpers';

interface PDFDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  progress?: number;
  error?: string | null;
}

export function PDFDropzone({
  onFileSelect,
  isLoading,
  progress,
  error
}: PDFDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setDragError(null);

      if (isLoading) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const validation = validatePDFFile(file);
      if (!validation.valid) {
        setDragError(validation.error || 'Invalid file');
        return;
      }

      onFileSelect(file);
    },
    [isLoading, onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && !isLoading) {
        const validation = validatePDFFile(file);
        if (!validation.valid) {
          setDragError(validation.error || 'Invalid file');
          return;
        }
        onFileSelect(file);
      }
    },
    [isLoading, onFileSelect]
  );

  const handleClick = () => {
    if (!isLoading) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer',
        isDragOver
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-dark-700 hover:border-dark-600 bg-dark-900/50',
        isLoading && 'pointer-events-none opacity-60'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="p-8 text-center">
        {isLoading ? (
          <>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader2 className="w-16 h-16 text-primary-400 animate-spin" />
              {progress !== undefined && progress > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-400">
                  {progress}%
                </span>
              )}
            </div>
            <p className="text-dark-200 font-medium">Processing PDF...</p>
            <p className="text-sm text-dark-500 mt-1">
              Extracting text content
            </p>
          </>
        ) : error || dragError ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-medium">{error || dragError}</p>
            <p className="text-sm text-dark-500 mt-1">
              Click or drag to try again
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-dark-200 font-medium">
              Drop your PDF here or click to browse
            </p>
            <p className="text-sm text-dark-500 mt-1">
              Supports PDF files up to 50MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
