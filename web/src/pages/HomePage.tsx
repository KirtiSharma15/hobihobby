/**
 * Home Page - "My Hobbies" Dashboard
 *
 * Personal dashboard for the signed-in (or local-only) user:
 * - Weekly activity + visit streak
 * - Active learning journeys (derived from real local lesson progress)
 * - Saved hobbies that haven't been started yet
 * - Milestones earned, derived from real save/quiz/progress/streak signals
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, BookOpen, Flame, Lock, Check, Compass, MessageCircle } from 'lucide-react';
import type { LearningPath } from '@shared/types';
import { useLocalSavedHobbies } from '@/hooks/useLocalSavedHobbies';
import { getAllProgress, type HobbyProgress } from '@/hooks/useLocalProgress';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { LEARNING_PATHS } from '@/data/learningPaths';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import { trackPageView, getVisitStreak, getWeekActivity } from '@/utils/analytics';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Art & Craft hobbies data (matches backend)
const ART_CRAFT_HOBBIES = [
  {
    id: 'watercolor-painting',
    title: 'Watercolor Painting',
    difficulty: 'beginner',
    timePerWeek: '3 hrs/wk',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
  },
  {
    id: 'acrylic-painting',
    title: 'Acrylic Painting',
    difficulty: 'beginner',
    timePerWeek: '3 hrs/wk',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
  },
  {
    id: 'pottery-ceramics',
    title: 'Pottery & Ceramics',
    difficulty: 'beginner',
    timePerWeek: '3 hrs/wk',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy & Lettering',
    difficulty: 'beginner',
    timePerWeek: '2 hrs/wk',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
  },
  {
    id: 'hand-lettering',
    title: 'Hand Lettering',
    difficulty: 'beginner',
    timePerWeek: '2 hrs/wk',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
  },
];

const THUMB_TINTS = [
  'from-amber-700/20 to-amber-700/5',
  'from-rose-400/25 to-rose-300/10',
  'from-olive/25 to-olive/10',
  'from-amber-500/20 to-amber-400/5',
];

const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(44,24,16,0.08) 0px, rgba(44,24,16,0.08) 10px, transparent 10px, transparent 20px)',
};

/** Day of the 365-day journey, derived from when the hobby was first started. */
const getDayNumber = (progress: HobbyProgress): number => {
  const started = new Date(progress.startedAt).getTime();
  const days = Math.floor((Date.now() - started) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(days, 1), 365);
};

/** Title of the lesson the user is currently on (or the next one to start). */
const getCurrentTaskTitle = (hobbyId: string, progress: HobbyProgress): string => {
  const path = (LEARNING_PATHS as unknown as Record<string, LearningPath>)[hobbyId];
  if (!path) return 'Continue learning';
  if (progress.currentLessonId) {
    for (const mod of path.modules) {
      const lesson = mod.lessons.find((l) => l.id === progress.currentLessonId);
      if (lesson) return lesson.title;
    }
  }
  return path.modules[0]?.lessons[0]?.title || 'Get started';
};

const getProgressPercent = (hobbyId: string, progress: HobbyProgress): number => {
  const total = (LEARNING_PATHS as unknown as Record<string, LearningPath>)[hobbyId]?.totalLessons || 1;
  return Math.min(100, Math.round((progress.completedLessons.length / total) * 100));
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const profile = useAppSelector((state) => state.user.profile);
  const recommendations = useAppSelector((state) => state.ai.recommendations);

  const firstName = profile?.displayName?.split(' ')[0] || 'there';
  const streak = getVisitStreak();
  const weekActivity = getWeekActivity();
  const activeDaysCount = weekActivity.filter(Boolean).length;

  const allProgress = getAllProgress();
  const journeys = ART_CRAFT_HOBBIES
    .map((hobby) => ({ hobby, progress: allProgress[hobby.id] }))
    .filter((entry): entry is { hobby: (typeof ART_CRAFT_HOBBIES)[number]; progress: HobbyProgress } =>
      Boolean(entry.progress)
    )
    .sort((a, b) => new Date(b.progress.lastActivityAt).getTime() - new Date(a.progress.lastActivityAt).getTime());

  const savedHobbyList = ART_CRAFT_HOBBIES.filter((h) => savedHobbies.has(h.id) && !allProgress[h.id]);

  const hasAnyProgress = journeys.length > 0;
  const hasQuizResults = recommendations.length > 0;

  const milestones = [
    {
      id: 'first-save',
      label: 'First save',
      icon: <Heart className="h-5 w-5" />,
      unlocked: savedHobbies.size > 0,
      tint: 'bg-terracotta/10 text-terracotta',
      target: undefined as number | undefined,
    },
    {
      id: 'quiz-done',
      label: 'Quiz done',
      icon: <Sparkles className="h-5 w-5" />,
      unlocked: hasQuizResults,
      tint: 'bg-olive/10 text-olive',
      target: undefined as number | undefined,
    },
    {
      id: 'first-lesson',
      label: 'First lesson',
      icon: <BookOpen className="h-5 w-5" />,
      unlocked: hasAnyProgress,
      tint: 'bg-amber-100 text-amber-700',
      target: undefined as number | undefined,
    },
    {
      id: 'streak-7',
      label: '7-day streak',
      icon: <Flame className="h-5 w-5" />,
      unlocked: streak >= 7,
      tint: 'bg-amber-100 text-amber-700',
      target: 7,
    },
    {
      id: 'streak-10',
      label: '10-day streak',
      icon: <Flame className="h-5 w-5" />,
      unlocked: streak >= 10,
      tint: 'bg-amber-100 text-amber-700',
      target: 10,
    },
  ];

  // Track page view on mount
  useEffect(() => {
    trackPageView('/');
  }, []);

  const StreakHeroCard = (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-500 to-terracotta p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
          🔥
        </div>
        <div>
          <p className="text-xl font-bold text-white">{streak}-day streak</p>
          <p className="text-sm text-white/85">Keep the fire going — one small session a day.</p>
        </div>
      </div>
      <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-center">
        <p className="text-lg font-bold text-white">
          {activeDaysCount}/7
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">this week</p>
      </div>
    </div>
  );

  const StreakCard = (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">This week</h2>
        <span className="text-xs text-taupe">{activeDaysCount} of 7 days active</span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                weekActivity[i] ? 'bg-olive text-white' : 'bg-border text-transparent'
              )}
            >
              {weekActivity[i] && <Check className="h-4 w-4" strokeWidth={3} />}
            </div>
            <span className="text-[11px] font-medium text-taupe">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const MilestonesSection = (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Milestones</h2>
        <button
          type="button"
          onClick={() => showToast('More milestones coming soon')}
          className="text-sm font-medium text-terracotta"
        >
          See all
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {milestones.map((m) => {
          const status = m.unlocked
            ? 'Unlocked'
            : m.target !== undefined
              ? `${m.target - streak} to go`
              : 'Locked';
          return (
            <div
              key={m.id}
              className="flex w-20 flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-3 text-center shadow-sm"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  m.unlocked ? m.tint : 'bg-border text-taupe opacity-60'
                )}
              >
                {m.unlocked ? m.icon : <Lock className="h-4 w-4" />}
              </div>
              <p className={cn('text-xs font-medium leading-tight text-ink', !m.unlocked && 'opacity-60')}>
                {m.label}
              </p>
              <p className="text-[10px] text-taupe">{status}</p>
            </div>
          );
        })}
      </div>
    </section>
  );

  const QuickActionsCard = (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="mb-3 font-semibold text-ink">Quick actions</h2>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/coach')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-terracotta py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
        >
          <MessageCircle className="h-4 w-4" />
          Ask HobiCoach
        </button>
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-terracotta/10 py-3 text-center text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/15"
        >
          <Sparkles className="h-4 w-4" />
          Take the quiz
        </button>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-cream"
        >
          <Compass className="h-4 w-4" />
          Explore new hobbies
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pb-24 font-jakarta lg:pb-12">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-taupe">My Hobbies</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Keep it going, {firstName}</h1>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
            🔥 {streak}
          </span>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          {/* Main column */}
          <div className="lg:w-[62%]">
            {StreakHeroCard}
            <div className="mt-4 lg:hidden">{StreakCard}</div>

            {/* Active journeys */}
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-ink">Active journeys</h2>
                <span className="text-sm text-taupe">{journeys.length}</span>
              </div>

              {journeys.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
                  <p className="text-sm font-medium text-ink">No active journeys yet</p>
                  <button
                    type="button"
                    onClick={() => navigate('/explore')}
                    className="mt-2 text-sm font-semibold text-terracotta"
                  >
                    Start one →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {journeys.map(({ hobby, progress }, index) => {
                    const day = getDayNumber(progress);
                    const percent = getProgressPercent(hobby.id, progress);
                    const task = getCurrentTaskTitle(hobby.id, progress);
                    return (
                      <div key={hobby.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br',
                              THUMB_TINTS[index % THUMB_TINTS.length]
                            )}
                            style={STRIPE_STYLE}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-semibold text-ink">{hobby.title}</h3>
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                                🔥 {day}
                              </span>
                            </div>
                            <p className="truncate text-xs text-taupe">
                              Day {day} of 365 · {task}
                            </p>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full rounded-full bg-terracotta transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/hobby/${hobby.id}/learn`)}
                            className={cn(
                              'hidden shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors md:block',
                              index === 0
                                ? 'bg-terracotta text-white hover:bg-terracotta-dark'
                                : 'bg-terracotta/10 text-terracotta hover:bg-terracotta/15'
                            )}
                          >
                            Continue →
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/hobby/${hobby.id}/learn`)}
                          className={cn(
                            'mt-3 block w-full rounded-2xl py-3 text-center text-sm font-semibold transition-colors md:hidden',
                            index === 0
                              ? 'bg-terracotta text-white hover:bg-terracotta-dark'
                              : 'bg-terracotta/10 text-terracotta hover:bg-terracotta/15'
                          )}
                        >
                          Continue Day {day} →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Saved for later */}
            {savedHobbyList.length > 0 && (
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-ink">Saved for later</h2>
                  <span className="text-sm text-taupe">{savedHobbyList.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {savedHobbyList.map((hobby, index) => (
                    <div
                      key={hobby.id}
                      onClick={() => navigate(`/hobby/${hobby.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm"
                    >
                      <div
                        className={cn(
                          'h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br',
                          THUMB_TINTS[index % THUMB_TINTS.length]
                        )}
                        style={STRIPE_STYLE}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{hobby.title}</p>
                        <p className="text-xs capitalize text-taupe">
                          {hobby.difficulty} · {hobby.timePerWeek}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveHobby(hobby.id);
                        }}
                        aria-label="Remove from saved"
                        className="shrink-0 text-terracotta"
                      >
                        <Heart className="h-5 w-5 fill-terracotta" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-8 lg:hidden">{MilestonesSection}</div>
          </div>

          {/* Sidebar - desktop only */}
          <aside className="hidden lg:block lg:w-[38%]">
            <div className="sticky top-24 space-y-6">
              {StreakCard}
              {MilestonesSection}
              {QuickActionsCard}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
