'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { meetingService } from '@/services/meeting.service';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/types/chat.types';
import { toast } from 'sonner';

interface ChatPanelProps {
  meetingId: string;
}

export function ChatPanel({ meetingId }: ChatPanelProps) {
  const toggleChat = useUiStore((s) => s.toggleChat);
  const { messages, addMessage, loadHistory, markRead } = useChatStore();
  const getMeetingAccessToken = useAuthStore((s) => s.getMeetingAccessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    markRead();
    meetingService
      .getChat(meetingId)
      .then(({ data }) => {
        if (data.success) loadHistory(data.data.messages);
      })
      .catch(() => {});

    const meetingToken = getMeetingAccessToken();
    if (!meetingToken) return;
    const socket = getMeetingSocket(meetingToken);
    const handler = ({ message }: { message: ChatMessage }) => addMessage(message);
    const onError = (e: { code?: string; message?: string }) => {
      if (e?.code === 'CHAT_FAILED') toast.error(e.message ?? 'Chat failed');
    };
    socket.on('new-message', handler);
    socket.on('error', onError);
    return () => {
      socket.off('new-message', handler);
      socket.off('error', onError);
    };
  }, [meetingId, getMeetingAccessToken, addMessage, loadHistory, markRead]);

  return (
    <aside className="flex w-80 flex-col border-l border-sky-100 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-sky-100 p-4">
        <h3 className="font-semibold text-slate-900">In-call messages</h3>
        <button type="button" onClick={toggleChat} className="text-slate-400 hover:text-sky-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <MessageList messages={messages} />
      <ChatInput meetingId={meetingId} senderName={user?.name ?? 'Guest'} />
    </aside>
  );
}
