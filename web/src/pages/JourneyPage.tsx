/**
 * Journey Page - Artisan Theme
 *
 * Daily view of a user's 365-day hobby journey: today's task, progress
 * through the journey, streak info, a peek at upcoming (locked) days, and
 * the primary "mark day complete" action. Milestones earned on completion
 * are celebrated in an overlay modal.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, Trophy, Loader2 } from 'lucide-react';
import { useJourney } from '@/hooks/useJourney';
import { cn } from '@/utils/cn';

const MILESTONE_LABELS: Record<string, string> = {
  first_day: 'First Day Complete! \u{1F389}',
  three_day_streak: '3-Day Streak! \u{1F525}',
  week_streak: '7-Day Streak! \u{1F525}',
  month_streak: '30-Day Streak! \u{1F525}',
  ten_days: '10 Days Completed! \u{1F31F}',
  thirty_days: '30 Days Completed! \u{1F31F}',
};

const formatMilestone = (id: string): string => MILESTONE_LABELS[id] ?? id;

interface CompleteButtonProps {
  currentDay: number;
  isCompletedToday: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
  className?: string;
}

const CompleteDayButton: React.FC<CompleteButtonProps> = ({
  currentDay,
  isCompletedToday,
  isSubmitting,
  onComplete,
  className,
}) => {
  if (isCompletedToday) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'w-full rounded-2xl bg-olive py-3 text-sm font-semibold text-white opacity-90',
          className
        )}
      >
        Day {currentDay} Complete! 🎉
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onComplete}
      disabled={isSubmitting}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span>Mark Day {currentDay} Complete ✓</span>
      )}
    </button>
  );
};

export const JourneyPage: React.FC = () => {
  const { hobbyId } = useParams<{ hobbyId: string }>();
  const navigate = useNavigate();
  const {
    activeJourneys,
    currentTemplate,
    isLoading,
    error,
    startJourney,
    completeDay,
    loadJourneyTemplate,
  } = useJourney();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationQueue, setCelebrationQueue] = useState<string[]>([]);

  const journey = hobbyId ? activeJourneys[hobbyId] : undefined;

  useEffect(() => {
    if (!hobbyId) return;
    loadJourneyTemplate(hobbyId);
    // Template only needs to load once per hobby visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hobbyId]);

  useEffect(() => {
    if (!hobbyId || journey) return;
    startJourney(hobbyId).catch(() => {
      // Error surfaced via the hook's shared `error` state.
    });
    // Only (re)attempt when there is no journey yet for this hobby.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hobbyId, journey]);

  if (!hobbyId) {
    return null;
  }

  const currentDay = journey?.currentDay ?? 1;
  const totalDays = journey?.totalDays ?? 365;
  const progressPct = Math.min(100, Math.max(0, (currentDay / totalDays) * 100));
  const isCompletedToday = journey?.completedDays.includes(currentDay) ?? false;

  const todaysTask = currentTemplate?.find((d) => d.day === currentDay) ?? null;
  const upcomingDays =
    currentTemplate?.filter((d) => d.day > currentDay && d.day <= currentDay + 3) ?? [];

  const handleComplete = async () => {
    if (!journey || isCompletedToday) return;
    setIsSubmitting(true);
    try {
      const result = await completeDay(hobbyId, currentDay);
      if (result.newMilestones.length > 0) {
        setCelebrationQueue((prev) => [...prev, ...result.newMilestones]);
      }
    } catch {
      // Error surfaced via the hook's shared `error` state.
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissCelebration = () => {
    setCelebrationQueue((prev) => prev.slice(1));
  };

  const activeCelebration = celebrationQueue[0];

  return (
    <div className="min-h-screen bg-cream pb-32 font-jakarta lg:pb-16">
      <div className="mx-auto max-w-2xl px-4 pt-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/hobby/${hobbyId}`)}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-sm transition-colors hover:bg-border/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-lg font-semibold text-ink">
            {journey?.hobbyName ?? 'Your journey'}
          </h1>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
            🔥 {journey?.streak ?? 0} days
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Hero card */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <p className="text-xs font-medium text-taupe">
            Day {currentDay} of {totalDays}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {isLoading && !journey ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
            </div>
          ) : todaysTask ? (
            <>
              <h2 className="mt-5 text-2xl font-bold text-ink">{todaysTask.title}</h2>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-taupe">
                  ⏱ {todaysTask.duration}
                </span>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-taupe">
                  📚 {todaysTask.type}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-taupe">{todaysTask.description}</p>

              <div className="mt-4 rounded-xl bg-olive/10 p-3">
                <p className="text-sm text-olive">💡 {todaysTask.tip}</p>
              </div>

              {/* Desktop: inline complete button below tip box */}
              <CompleteDayButton
                currentDay={currentDay}
                isCompletedToday={isCompletedToday}
                isSubmitting={isSubmitting}
                onComplete={handleComplete}
                className="mt-6 hidden lg:flex"
              />
            </>
          ) : (
            <p className="mt-5 text-sm text-taupe">
              New tasks for this day are being prepared — check back soon!
            </p>
          )}
        </div>

        {/* Upcoming days */}
        {upcomingDays.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">Coming up</h3>
            <div className="space-y-2">
              {upcomingDays.map((day) => (
                <div
                  key={day.day}
                  className="flex items-center gap-3 rounded-xl bg-surface p-3 opacity-60"
                >
                  <Lock className="h-4 w-4 shrink-0 text-taupe" />
                  <p className="min-w-0 truncate text-sm text-taupe">
                    Day {day.day}: {day.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: sticky bottom complete bar */}
      {todaysTask && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface p-4 lg:hidden">
          <CompleteDayButton
            currentDay={currentDay}
            isCompletedToday={isCompletedToday}
            isSubmitting={isSubmitting}
            onComplete={handleComplete}
          />
        </div>
      )}

      {/* Milestone celebration modal */}
      {activeCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-lg animate-fadeIn">
            <Trophy className="mx-auto h-14 w-14 text-amber-500" />
            <h3 className="mt-4 text-xl font-bold text-ink">
              {formatMilestone(activeCelebration)}
            </h3>
            <button
              type="button"
              onClick={dismissCelebration}
              className="mt-6 w-full rounded-2xl bg-terracotta py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              Keep going!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPage;
