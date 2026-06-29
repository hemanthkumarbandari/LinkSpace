import { format } from 'date-fns';
import type { ChatMessage } from '@/types/chat.types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isSystem = message.type === 'system';
  return (
    <div className={isSystem ? 'text-center text-xs text-slate-500' : ''}>
      {!isSystem && (
        <p className="text-xs font-medium text-sky-600">{message.senderName}</p>
      )}
      <p className="text-sm text-slate-800">{message.message}</p>
      {!isSystem && (
        <p className="mt-0.5 text-[10px] text-slate-400">
          {format(new Date(message.createdAt), 'HH:mm')}
        </p>
      )}
    </div>
  );
}
