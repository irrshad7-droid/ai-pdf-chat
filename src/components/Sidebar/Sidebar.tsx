import { X, Upload, Trash2 } from 'lucide-react';
import type { PDFDocument, SuggestedQuestion, QuickAction } from '../../types';
import { DocumentInfo } from './DocumentInfo';
import { QuickActions } from './QuickActions';
import { SuggestedQuestions } from './SuggestedQuestions';
import Button from '../UI/Button';

interface SidebarProps {
  document: PDFDocument | null;
  suggestedQuestions: SuggestedQuestion[];
  onQuestionSelect: (question: string) => void;
  onQuickAction: (action: QuickAction) => void;
  onUploadNew: () => void;
  onClearDocument: () => void;
  isProcessing?: boolean;
  isChatLoading?: boolean;
  activeQuickAction?: QuickAction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  document,
  suggestedQuestions,
  onQuestionSelect,
  onQuickAction,
  onUploadNew,
  onClearDocument,
  isProcessing,
  isChatLoading,
  activeQuickAction,
  isOpen,
  onClose
}: SidebarProps) {
  const disabled = isProcessing || isChatLoading;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-80 bg-dark-950 border-r border-dark-800
          transform transition-transform duration-300 z-50
          lg:relative lg:transform-none lg:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <h2 className="text-lg font-semibold text-white">Document</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {document ? (
            <>
              <DocumentInfo document={document} />

              <QuickActions
                onAction={onQuickAction}
                disabled={isProcessing}
                activeAction={activeQuickAction}
              />

              {suggestedQuestions.length > 0 && (
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onSelect={onQuestionSelect}
                  disabled={isProcessing || !!activeQuickAction}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-dark-400" />
              </div>
              <p className="text-dark-400 text-sm">
                Upload a PDF to get started
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {document && (
          <div className="p-4 border-t border-dark-800 space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-center"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={onUploadNew}
              disabled={disabled}
            >
              Upload New
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={onClearDocument}
              disabled={disabled}
            >
              Clear Document
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
