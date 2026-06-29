import { create } from 'zustand';
import type { ChatMessage } from '@/types/chat.types';

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  addMessage: (message: ChatMessage) => void;
  loadHistory: (messages: ChatMessage[]) => void;
  markRead: () => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  unreadCount: 0,
  addMessage: (message) =>
    set((s) => {
      if (s.messages.some((m) => m._id === message._id)) return s;
      return {
        messages: [...s.messages, message],
        unreadCount: s.unreadCount + 1,
      };
    }),
  loadHistory: (messages) => set({ messages }),
  markRead: () => set({ unreadCount: 0 }),
  clear: () => set({ messages: [], unreadCount: 0 }),
}));
