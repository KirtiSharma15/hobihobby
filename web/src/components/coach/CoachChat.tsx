import React, { useEffect, useRef } from 'react';
import { useHobbyCoach } from '../../hooks/useHobbyCoach';
import CoachMessage from './CoachMessage';
import CoachInput from './CoachInput';

interface Props {
  hobbyContext?: string;
}

const CoachChat: React.FC<Props> = ({ hobbyContext }) => {
  const { chatHistory, isLoading, sendMessage } = useHobbyCoach(hobbyContext);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          H
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">HobiCoach</p>
          <p className="text-xs text-green-500">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chatHistory.length === 0 && (
          <div className="text-center mt-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl mx-auto mb-3">
              👋
            </div>
            <p className="font-semibold text-gray-700">Hi! I'm your HobiCoach</p>
            <p className="text-sm text-gray-400 mt-1">
              {hobbyContext
                ? `Ask me anything about ${hobbyContext}!`
                : 'Ask me anything about hobbies!'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {['Where do I start?', 'What gear do I need?', 'How long to learn?'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs bg-white border border-purple-200 text-purple-600 rounded-full px-3 py-1.5 hover:bg-purple-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {chatHistory.map((message) => (
          <CoachMessage key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
              H
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <CoachInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default CoachChat;