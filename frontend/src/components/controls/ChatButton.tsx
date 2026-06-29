'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';

export function ChatButton() {
  const toggleChat = useUiStore((s) => s.toggleChat);
  const unreadCount = useChatStore((s) => s.unreadCount);

  return (
    <Button variant="secondary" size="icon" onClick={toggleChat} className="relative">
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
          {unreadCount}
        </span>
      )}
    </Button>
  );
}
