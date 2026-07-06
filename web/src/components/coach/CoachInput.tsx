import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const CoachInput: React.FC<Props> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-shrink-0 items-end gap-2 border-t border-border bg-surface p-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask your coach anything…"
        rows={1}
        className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-cream px-4 py-2.5 text-sm text-ink placeholder:text-taupe focus:border-terracotta focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        aria-label="Send message"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-terracotta transition-colors hover:bg-terracotta-dark disabled:opacity-40"
      >
        <Send className="h-4 w-4 rotate-90 text-white" />
      </button>
    </div>
  );
};

export default CoachInput;
