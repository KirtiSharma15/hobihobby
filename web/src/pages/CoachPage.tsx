import React from 'react';
import CoachChat from '../components/coach/CoachChat';
import { useHobbyCoach } from '../hooks/useHobbyCoach';

const SUGGESTED_QUESTIONS = [
  'Getting started tips',
  'Choosing your first project',
  'Building a daily habit',
  'Am I on track with my journey?',
];

const CoachPage: React.FC = () => {
  const { sendMessage } = useHobbyCoach();

  return (
    <div className="bg-cream">
      <div className="mx-auto flex max-w-5xl items-start justify-center gap-6 md:px-6 md:py-8">
        {/* Suggested topics sidebar - xl screens only */}
        <aside className="hidden w-56 shrink-0 xl:block">
          <h3 className="mb-3 text-sm font-semibold text-ink">Suggested questions</h3>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm text-ink shadow-sm transition-colors hover:border-terracotta/40 hover:text-terracotta"
              >
                {question}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <div className="flex h-[calc(100vh-9rem)] w-full flex-col overflow-hidden bg-surface shadow-2xl md:h-[calc(100vh-4rem)] md:max-h-[700px] md:max-w-2xl md:rounded-2xl">
          <CoachChat />
        </div>
      </div>
    </div>
  );
};

export default CoachPage;
