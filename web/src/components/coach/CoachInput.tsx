import React, { useState } from 'react';

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
    <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-100">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask your hobby coach..."
        rows={1}
        className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 max-h-32"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center disabled:opacity-40 hover:bg-purple-700 transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4 text-white rotate-90" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </div>
  );
};

export default CoachInput;