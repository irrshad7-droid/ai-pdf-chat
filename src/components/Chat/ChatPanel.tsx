import type { Message } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatEmptyState } from './ChatEmptyState';
import { NoDocumentState } from './NoDocumentState';
import { useAutoScroll } from '../../hooks';
import { MessageSkeleton } from '../UI';

interface ChatPanelProps {
  messages: Message[];
  documentLoaded: boolean;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatPanel({
  messages,
  documentLoaded,
  isLoading,
  onSendMessage
}: ChatPanelProps) {
  const scrollRef = useAutoScroll(messages);

  if (!documentLoaded) {
    return (
      <div className="flex-1 flex flex-col bg-dark-950">
        <NoDocumentState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-950">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <MessageSkeleton />
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading}
          disabled={!documentLoaded}
        />
      </div>
    </div>
  );
}
