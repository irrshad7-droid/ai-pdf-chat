import { Lightbulb, Loader2 } from 'lucide-react';
import type { SuggestedQuestion } from '../../types';
import { cn } from '../../utils/cn';

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (question: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SuggestedQuestions({ questions, onSelect, disabled, isLoading }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-3 animate-slide-in-left" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <h4 className="text-xs font-medium text-dark-400 uppercase tracking-wider">
          Suggested Questions
        </h4>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
          <span className="text-sm text-dark-400 ml-2">Loading suggestions...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => onSelect(q.question)}
              disabled={disabled}
              className={cn(
                'w-full text-left text-sm',
                'py-2 px-3 rounded-lg',
                'bg-dark-800/50 hover:bg-dark-800',
                'border border-dark-700/50 hover:border-dark-600',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dark-800/50',
                'line-clamp-2',
                disabled && 'text-dark-500'
              )}
            >
              {q.question}
            </button>
          ))}
        </div>
      )}

      {disabled && !isLoading && (
        <p className="text-xs text-dark-500 text-center">
          Wait for current request to complete
        </p>
      )}
    </div>
  );
}
