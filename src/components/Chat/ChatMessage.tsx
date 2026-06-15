import { Bot, User, FileText } from 'lucide-react';
import type { Message } from '../../types';
import { formatTimestamp } from '../../utils/helpers';
import { cn } from '../../utils/cn';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 animate-slide-up',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary-600'
            : 'bg-gradient-to-br from-primary-500 to-primary-700'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 max-w-[85%] md:max-w-[75%]')}>
        <div
          className={cn(
            'rounded-2xl p-4',
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-dark-800 text-dark-100 rounded-tl-sm border border-dark-700'
          )}
        >
          {message.isTyping ? (
            <div className="flex items-center gap-1 py-2">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2 h-2 bg-dark-400 rounded-full animate-typing"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              {message.content.split('\n').map((line, idx) => (
                <p key={idx} className="mb-2 last:mb-0">
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && !message.isTyping && (
          <div className="mt-2">
            <p className="text-xs text-dark-500 mb-1">Sources:</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-dark-800/50 text-dark-400 rounded"
                >
                  <FileText className="w-3 h-3" />
                  Page {source.pageNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            'text-xs text-dark-500 mt-1',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
