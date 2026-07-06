import React from 'react';
import { Message } from '../../store/slices/aiSlice';
import { cn } from '../../utils/cn';
import { CoachAvatar } from './CoachAvatar';

interface Props {
  message: Message;
}

/** Renders **bold** markdown segments from the AI reply as <strong> text. */
const renderContent = (text: string): React.ReactNode =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

const CoachMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('mb-3 flex', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <CoachAvatar size="sm" className="mr-2 mt-1" />}
      <div
        className={cn(
          'max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-terracotta text-white'
            : 'rounded-bl-sm border border-border bg-surface text-ink shadow-sm'
        )}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
};

export default CoachMessage;
