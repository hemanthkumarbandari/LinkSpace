'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
import { useMeetingStore } from '@/store/meetingStore';
import { useChatStore } from '@/store/chatStore';
import type { ChatMessage } from '@/types/chat.types';

interface ChatInputProps {
  meetingId: string;
  senderName: string;
}

export function ChatInput({ meetingId, senderName: _senderName }: ChatInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const getMeetingAccessToken = useAuthStore((s) => s.getMeetingAccessToken);
  const meetingStatus = useMeetingStore((s) => s.status);
  const addMessage = useChatStore((s) => s.addMessage);

  const send = () => {
    const body = text.trim();
    const meetingToken = getMeetingAccessToken();
    if (!body || !meetingToken || sending) return;

    if (meetingStatus !== 'connected') {
      toast.error('Still connecting to the meeting server…');
      return;
    }

    const socket = getMeetingSocket(meetingToken);
    if (!socket.connected) {
      toast.error('Lost connection to meeting server. Wait for reconnect or refresh.');
      return;
    }

    setSending(true);
    socket.emit(
      'send-message',
      {
        meetingId,
        message: body,
        type: 'text',
      },
      (response?: { message?: ChatMessage; error?: { message: string } }) => {
        setSending(false);
        if (response?.error) {
          toast.error(response.error.message ?? 'Failed to send message');
          return;
        }
        if (response?.message) {
          addMessage(response.message);
        }
      }
    );
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex gap-2 border-t border-sky-100 p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        rows={2}
        disabled={sending}
        className="flex-1 resize-none rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
      />
      <Button size="icon" onClick={send} disabled={!text.trim() || sending}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
