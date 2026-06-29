import { REACTION_EMOJIS } from '@/config/constants';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-12 left-0 z-50 flex gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="text-2xl hover:scale-125 transition-transform"
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
