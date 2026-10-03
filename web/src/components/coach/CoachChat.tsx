import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock } from 'lucide-react';
import { useHobbyCoach } from '../../hooks/useHobbyCoach';
import { getVisitStreak } from '../../utils/analytics';
import { cn } from '../../utils/cn';
import { CoachAvatar } from './CoachAvatar';
import CoachMessage from './CoachMessage';
import CoachInput from './CoachInput';

interface Props {
  hobbyContext?: string;
  activeJourneyDisplay?: {
    id: string;
    title: string;
    day: number;
    lesson: {
      title: string;
      duration: string;
      type: string;
    } | null;
  } | null;
}

const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(44,24,16,0.08) 0px, rgba(44,24,16,0.08) 8px, transparent 8px, transparent 16px)',
};

const SUGGESTIONS = ['Where do I start?', 'What gear do I need?', 'How long to learn?'];

const CoachChat: React.FC<Props> = ({ hobbyContext, activeJourneyDisplay }) => {
  const { chatHistory, isLoading, sendMessage } = useHobbyCoach(hobbyContext);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const streak = getVisitStreak();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3">
        {/*
          Navigate to a fixed route rather than navigate(-1): browser history
          is unreliable here because signInWithRedirect leaves and re-enters
          the tab, and Coach is also reachable directly from several entry
          points (nav bar, home, quiz results) with no guaranteed prior page.
        */}
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Go back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink transition-colors hover:bg-border/50 md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <CoachAvatar showOnlineDot />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">HobiCoach</p>
          <p className="text-xs text-olive">Online · here to help</p>
        </div>
        {streak > 0 && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
            🔥 {streak}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-cream px-4 py-4">
        {activeJourneyDisplay && (
          <div className="mb-4 flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive/10 px-3 py-1 text-xs font-medium text-olive">
              <Clock className="h-3.5 w-3.5" />
              Day {activeJourneyDisplay.day} of your {activeJourneyDisplay.title} journey
            </span>

            {activeJourneyDisplay.lesson && (
              <div className="mt-3 flex w-full max-w-xs items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
                <div
                  className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-terracotta/20 to-olive/10"
                  style={STRIPE_STYLE}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    Day {activeJourneyDisplay.day} · {activeJourneyDisplay.lesson.title}
                  </p>
                  <p className="truncate text-xs text-taupe">
                    ~{activeJourneyDisplay.lesson.duration} · {activeJourneyDisplay.lesson.type}
                  </p>
                </div>
              </div>
            )}

            {activeJourneyDisplay.lesson && (
              <button
                type="button"
                onClick={() => navigate(`/hobby/${activeJourneyDisplay.id}`)}
                className="mt-2 w-full max-w-xs rounded-2xl bg-terracotta py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
              >
                View hobby →
              </button>
            )}
          </div>
        )}

        {chatHistory.length === 0 && (
          <div className="mt-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-terracotta text-2xl">
              👋
            </div>
            <p className="font-semibold text-ink">Hi! I&apos;m your HobiCoach</p>
            <p className="mt-1 text-sm text-taupe">
              {hobbyContext
                ? `Ask me anything about ${hobbyContext}!`
                : 'Ask me anything about hobbies!'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-terracotta/30 bg-surface px-3 py-1.5 text-xs text-terracotta transition-colors hover:bg-terracotta/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((message) => (
          <CoachMessage key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="mb-3 flex items-end justify-start">
            <CoachAvatar size="sm" className="mr-2 mt-1" />
            <div className="rounded-2xl rounded-bl-sm bg-surface px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-taupe" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-taupe" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-taupe" style={{ animationDelay: '300ms' }} />
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
