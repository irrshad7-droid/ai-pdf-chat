import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  disabled,
  placeholder = 'Ask a question about your document...'
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex items-end gap-2 p-4 bg-dark-900 border-t border-dark-800">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-dark-800 border border-dark-700',
            'text-white placeholder-dark-500',
            'resize-none overflow-y-auto',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading || disabled}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl',
          'flex items-center justify-center',
          'bg-primary-600 hover:bg-primary-700',
          'text-white transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
