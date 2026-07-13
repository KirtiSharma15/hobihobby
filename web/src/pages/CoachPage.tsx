import React from 'react';
import CoachChat from '../components/coach/CoachChat';
import { useHobbyCoach } from '../hooks/useHobbyCoach';
import { useAppSelector } from '../hooks/useAppDispatch';
import type { Journey } from '../store/slices/journeySlice';

const CoachPage: React.FC = () => {
  const activeJourneys = useAppSelector(
    (state) => state.journey.activeJourneys
  );

  // Get most recent journey by lastActivityAt
  const mostRecentJourney = (Object.values(activeJourneys) as Journey[])
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
    )[0];

  const hobbyContext = mostRecentJourney
    ? `${mostRecentJourney.hobbyName}, Day ${mostRecentJourney.currentDay} of 365`
    : undefined;

  const SUGGESTED_QUESTIONS = hobbyContext
    ? [
        `Where do I start with ${mostRecentJourney?.hobbyName}?`,
        'What should I focus on today?',
        'Am I making good progress?',
        'What gear do I need next?',
      ]
    : [
        'Help me find a hobby',
        'What hobby suits a beginner?',
        'How much time do I need?',
        'What are popular hobbies in UAE?',
      ];

  const { sendMessage } = useHobbyCoach(hobbyContext);

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
          <CoachChat hobbyContext={hobbyContext} />
        </div>
      </div>
    </div>
  );
};

export default CoachPage;
