import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/types/chat.types';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <p className="text-center text-sm text-slate-500">No messages yet</p>
      ) : (
        messages.map((m) => <MessageBubble key={m._id} message={m} />)
      )}
    </div>
  );
}
