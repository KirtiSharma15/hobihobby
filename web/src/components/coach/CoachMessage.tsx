import React from 'react';
import { Message } from '../../store/slices/aiSlice';

interface Props {
  message: Message;
}

const CoachMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
          H
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default CoachMessage;