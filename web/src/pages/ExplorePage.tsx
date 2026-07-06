/**
 * Explore Page - Hobby Explorer (main browse screen)
 *
 * Discovery-first MVP screen: search, category chips, trending picks,
 * in-progress hobbies, and the full hobby grid. Save/unsave is backed by
 * Firebase (via useSaveHobby) so signed-in state and saved hobbies live in
 * Redux. Mobile renders a compact, scrollable feed; desktop renders a hero
 * banner plus a two-column layout with an AI match / stats / trending
 * sidebar.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Bell, Flame, Heart, Clock, Sparkles } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useSaveHobby } from '@/hooks/useSaveHobby';
import { getAllProgress } from '@/hooks/useLocalProgress';
import { getLearningPath, getLesson } from '@/data/learningPaths';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import { trackPageView, trackFilterUse, trackHobbySave, getVisitStreak } from '@/utils/analytics';
import type { RootState } from '@/store';

const CATEGORIES = [
  'All',
  'Art',
  'Music',
  'Sport',
  'Tech',
  'Nature',
  'Food',
  'Writing',
  'Outdoors',
] as const;

type Category = (typeof CATEGORIES)[number];

interface HobbyItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: Category;
  imageUrl: string;
  timePerWeek: string;
  cost: string;
  rating: number;
  tags: string[];
}

// Art & Craft hobbies data (matches backend)
const ART_CRAFT_HOBBIES: HobbyItem[] = [
  {
    id: 'watercolor-painting',
    title: 'Watercolor Painting',
    description:
      'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color.',
    difficulty: 'beginner',
    category: 'Art',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    timePerWeek: '3 hrs/wk',
    cost: '$48-88',
    rating: 4.8,
    tags: ['creative', 'relaxing', 'art'],
  },
  {
    id: 'acrylic-painting',
    title: 'Acrylic Painting',
    description:
      'Versatile and forgiving, acrylic painting lets you create bold artwork. Great for beginners.',
    difficulty: 'beginner',
    category: 'Art',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    timePerWeek: '3 hrs/wk',
    cost: '$40-60',
    rating: 4.7,
    tags: ['creative', 'colorful', 'art'],
  },
  {
    id: 'pottery-ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. Tactile and meditative.',
    difficulty: 'beginner',
    category: 'Art',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    timePerWeek: '3 hrs/wk',
    cost: '$45-80',
    rating: 4.9,
    tags: ['creative', 'hands-on', 'craft'],
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Creative and structured.',
    difficulty: 'beginner',
    category: 'Writing',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    timePerWeek: '2 hrs/wk',
    cost: '$23-32',
    rating: 4.6,
    tags: ['creative', 'precise', 'writing'],
  },
  {
    id: 'hand-lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography. Develop your own unique style.',
    difficulty: 'beginner',
    category: 'Writing',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    timePerWeek: '2 hrs/wk',
    cost: '$26-42',
    rating: 4.7,
    tags: ['creative', 'typography', 'design'],
  },
];

const DIFFICULTY_STYLES: Record<HobbyItem['difficulty'], string> = {
  beginner: 'bg-olive/15 text-olive',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-terracotta/15 text-terracotta',
};

interface ContinueHobby extends HobbyItem {
  percent: number;
  positionLabel: string;
}

const SaveHeartButton: React.FC<{ hobbyId: string; className?: string }> = ({
  hobbyId,
  className,
}) => {
  const { isSaved, toggleSave, isLoading } = useSaveHobby(hobbyId);
  const isAuthenticated = useAppSelector((state: RootState) => state.user.isAuthenticated);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Sign in to save hobbies');
      return;
    }
    trackHobbySave(hobbyId, hobbyId, !isSaved);
    toggleSave();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isSaved ? 'Remove from saved' : 'Save hobby'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface',
        isLoading && 'cursor-wait',
        className
      )}
    >
      <Heart className={cn('h-4 w-4', isSaved ? 'fill-terracotta text-terracotta' : 'text-taupe')} />
    </button>
  );
};

const TrendingHobbyCard: React.FC<{
  hobby: HobbyItem;
  onNavigate: (path: string) => void;
  variant?: 'scroll' | 'grid';
}> = ({ hobby, onNavigate, variant = 'scroll' }) => {
  const matchScore = Math.round(hobby.rating * 20);

  return (
    <div
      onClick={() => onNavigate(`/hobby/${hobby.id}`)}
      className={cn(
        'cursor-pointer overflow-hidden rounded-2xl bg-surface shadow-sm transition-transform hover:-translate-y-0.5',
        variant === 'scroll' ? 'w-[170px] shrink-0' : 'w-full'
      )}
    >
      <div className="relative h-32 w-full overflow-hidden">
        <img src={hobby.imageUrl} alt={hobby.title} className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-olive px-2 py-1 text-[11px] font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          {matchScore}% match
        </span>
        <SaveHeartButton hobbyId={hobby.id} className="absolute right-2 top-2 h-8 w-8" />
        <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white/80 drop-shadow">
          [ {hobby.tags[0]} ]
        </span>
      </div>
      <div className="p-3">
        <h3 className="mb-2 truncate text-sm font-bold text-ink">{hobby.title}</h3>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
              DIFFICULTY_STYLES[hobby.difficulty]
            )}
          >
            {hobby.difficulty}
          </span>
          <span className="flex items-center gap-1 truncate text-[11px] text-taupe">
            <Clock className="h-3 w-3 shrink-0" />
            {hobby.timePerWeek}
          </span>
        </div>
      </div>
    </div>
  );
};

const ContinueHobbyCard: React.FC<{ hobby: ContinueHobby; onNavigate: (path: string) => void }> = ({
  hobby,
  onNavigate,
}) => (
  <div
    onClick={() => onNavigate(`/hobby/${hobby.id}/learn`)}
    className="flex w-72 shrink-0 cursor-pointer items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm transition-transform hover:-translate-y-0.5"
  >
    <img
      src={hobby.imageUrl}
      alt={hobby.title}
      className="h-16 w-16 shrink-0 rounded-xl object-cover"
    />
    <div className="min-w-0 flex-1">
      <h3 className="truncate text-sm font-bold text-ink">{hobby.title}</h3>
      <p className="truncate text-xs text-taupe">{hobby.positionLabel}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-terracotta" style={{ width: `${hobby.percent}%` }} />
      </div>
    </div>
    <span className="shrink-0 text-lg font-bold text-terracotta">{hobby.percent}%</span>
  </div>
);

const HobbyGridCard: React.FC<{ hobby: HobbyItem; onNavigate: (path: string) => void }> = ({
  hobby,
  onNavigate,
}) => (
  <div
    onClick={() => onNavigate(`/hobby/${hobby.id}`)}
    className="cursor-pointer overflow-hidden rounded-2xl bg-surface shadow-sm transition-transform hover:-translate-y-0.5"
  >
    <div className="relative h-28 w-full overflow-hidden">
      <img src={hobby.imageUrl} alt={hobby.title} className="h-full w-full object-cover" />
      <SaveHeartButton hobbyId={hobby.id} className="absolute right-2 top-2 h-8 w-8" />
      <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white/80 drop-shadow">
        [ {hobby.tags[0]} ]
      </span>
    </div>
    <div className="p-3">
      <h3 className="mb-2 truncate text-sm font-bold text-ink">{hobby.title}</h3>
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
            DIFFICULTY_STYLES[hobby.difficulty]
          )}
        >
          {hobby.difficulty}
        </span>
        <span className="flex items-center gap-1 truncate text-[11px] text-taupe">
          <Clock className="h-3 w-3 shrink-0" />
          {hobby.timePerWeek}
        </span>
      </div>
    </div>
  </div>
);

interface CategoryChipsProps {
  activeCategory: Category;
  onChange: (category: Category) => void;
  className?: string;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ activeCategory, onChange, className }) => (
  <div className={className} style={{ scrollbarWidth: 'none' }}>
    {CATEGORIES.map((category) => (
      <button
        key={category}
        type="button"
        onClick={() => onChange(category)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          activeCategory === category
            ? 'bg-terracotta text-white'
            : 'border border-border bg-surface text-taupe hover:text-ink'
        )}
      >
        {category}
      </button>
    ))}
  </div>
);

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const profile = useAppSelector((state: RootState) => state.user.profile);
  const savedHobbyIds = useAppSelector((state: RootState) => state.hobbies.savedHobbyIds);
  const recommendations = useAppSelector((state: RootState) => state.ai.recommendations);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const exploreAllRef = useRef<HTMLDivElement>(null);

  // Track page view on mount
  useEffect(() => {
    trackPageView('/explore');
  }, []);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    if (category !== 'All') {
      trackFilterUse('explore_category', category);
    }
  };

  const firstName = profile?.displayName?.trim().split(' ')[0] || 'there';
  const streak = useMemo(() => getVisitStreak(), []);
  const topRecommendation = recommendations[0];

  // Trending: highest rated hobbies, shown with a derived match score
  const trendingHobbies = useMemo(
    () => [...ART_CRAFT_HOBBIES].sort((a, b) => b.rating - a.rating).slice(0, 4),
    []
  );

  // Pick up where you left off: saved hobbies, enriched with local learning progress
  const continueHobbies = useMemo<ContinueHobby[]>(() => {
    const allProgress = getAllProgress();

    return ART_CRAFT_HOBBIES.filter((hobby) => savedHobbyIds.includes(hobby.id)).map((hobby) => {
      const progress = allProgress[hobby.id];
      const path = getLearningPath(hobby.id);
      const totalLessons = path?.totalLessons ?? 0;
      const percent =
        progress && totalLessons > 0
          ? Math.round((progress.completedLessons.length / totalLessons) * 100)
          : 0;

      const currentLesson =
        progress?.currentLessonId && getLesson(hobby.id, progress.currentLessonId);
      const positionLabel = currentLesson
        ? `${currentLesson.moduleName} · ${currentLesson.title}`
        : 'Just saved · tap to begin';

      return { ...hobby, percent, positionLabel };
    });
  }, [savedHobbyIds]);

  const activeJourneysCount = useMemo(() => {
    const allProgress = getAllProgress();
    return ART_CRAFT_HOBBIES.filter((hobby) => Boolean(allProgress[hobby.id])).length;
  }, []);

  // Filter hobbies based on search query and active category chip
  const filteredHobbies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ART_CRAFT_HOBBIES.filter((hobby) => {
      const matchesCategory = activeCategory === 'All' || hobby.category === activeCategory;
      const matchesSearch =
        !query ||
        hobby.title.toLowerCase().includes(query) ||
        hobby.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const scrollToExploreAll = () => {
    exploreAllRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-cream pb-24 font-jakarta md:pb-12">
      {/* ============================= MOBILE ============================= */}
      <div className="mx-auto w-full max-w-md md:hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pb-4 pt-6">
          <div>
            <p className="text-sm text-taupe">Good morning,</p>
            <h1 className="text-2xl font-bold text-ink">{firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600">{streak}</span>
            </div>
            <button
              type="button"
              onClick={() => showToast("You're all caught up! No new notifications.")}
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface shadow-sm transition-colors hover:bg-white"
            >
              <Bell className="h-5 w-5 text-ink" />
            </button>
          </div>
        </header>

        {/* Search bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-taupe" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${ART_CRAFT_HOBBIES.length}+ hobbies...`}
              className="w-full bg-transparent text-sm text-ink placeholder:text-taupe focus:outline-none"
            />
            <button
              type="button"
              onClick={() => showToast('More filters coming soon')}
              aria-label="Filters"
              className="shrink-0 text-terracotta"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <CategoryChips
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
          className="flex gap-2 overflow-x-auto px-5 pb-6"
        />

        {/* Trending near you */}
        <section className="pb-8">
          <div className="flex items-center justify-between px-5 pb-4">
            <h2 className="text-lg font-bold text-ink">Trending near you</h2>
            <button
              type="button"
              onClick={() => showToast('Full trending list coming soon')}
              className="text-sm font-medium text-terracotta"
            >
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
            {trendingHobbies.slice(0, 3).map((hobby) => (
              <TrendingHobbyCard key={hobby.id} hobby={hobby} onNavigate={navigate} />
            ))}
          </div>
        </section>

        {/* Pick up where you left off - only when the user has saved hobbies */}
        {continueHobbies.length > 0 && (
          <section className="pb-8">
            <h2 className="px-5 pb-4 text-lg font-bold text-ink">Pick up where you left off</h2>
            <div
              className="flex gap-4 overflow-x-auto px-5 pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {continueHobbies.map((hobby) => (
                <ContinueHobbyCard key={hobby.id} hobby={hobby} onNavigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* Explore all */}
        <section className="px-5 pb-10">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-bold text-ink">Explore all</h2>
            <span className="text-sm text-taupe">{ART_CRAFT_HOBBIES.length} hobbies</span>
          </div>

          {filteredHobbies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredHobbies.map((hobby) => (
                <HobbyGridCard key={hobby.id} hobby={hobby} onNavigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface py-12 text-center">
              <p className="text-2xl">🔍</p>
              <p className="mt-2 text-sm font-medium text-ink">No hobbies found</p>
              <p className="mt-1 text-sm text-taupe">Try a different search or category</p>
            </div>
          )}
        </section>
      </div>

      {/* ============================= DESKTOP ============================= */}
      <div className="hidden md:block">
        {/* Hero banner */}
        <div className="mx-auto max-w-6xl px-8 pt-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta to-terracotta-dark px-10 py-10">
            <div className="pointer-events-none absolute -right-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border-2 border-dashed border-white/20" />
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              AI-matched to you
            </span>
            <h1 className="relative mt-4 max-w-lg text-3xl font-bold text-white lg:text-4xl">
              Discover your next passion
            </h1>
            <p className="relative mt-3 max-w-md text-sm text-white/85">
              60+ hobbies · AI-matched to you · UAE&apos;s #1 hobby platform
            </p>
            <div className="relative mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-terracotta transition-colors hover:bg-cream"
              >
                Take the Quiz →
              </button>
              <button
                type="button"
                onClick={scrollToExploreAll}
                className="rounded-2xl border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse hobbies
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mx-auto max-w-2xl px-8 pt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-taupe" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${ART_CRAFT_HOBBIES.length}+ hobbies...`}
              className="w-full bg-transparent text-sm text-ink placeholder:text-taupe focus:outline-none"
            />
            <button
              type="button"
              onClick={() => showToast('More filters coming soon')}
              aria-label="Filters"
              className="shrink-0 text-terracotta"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="mx-auto max-w-6xl px-8 pt-6">
          <CategoryChips
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
            className="flex flex-wrap gap-2"
          />
        </div>

        {/* Main + sidebar */}
        <div className="mx-auto max-w-6xl px-8 pt-8">
          <div className="lg:flex lg:items-start lg:gap-8">
            {/* Main column */}
            <div ref={exploreAllRef} className="lg:w-2/3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">Explore all</h2>
                <span className="text-sm text-taupe">{ART_CRAFT_HOBBIES.length} hobbies</span>
              </div>

              {filteredHobbies.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {filteredHobbies.map((hobby) => (
                    <HobbyGridCard key={hobby.id} hobby={hobby} onNavigate={navigate} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-surface py-12 text-center">
                  <p className="text-2xl">🔍</p>
                  <p className="mt-2 text-sm font-medium text-ink">No hobbies found</p>
                  <p className="mt-1 text-sm text-taupe">Try a different search or category</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:w-1/3">
              <div className="sticky top-24 space-y-4">
                {/* Your AI Match */}
                {topRecommendation ? (
                  <div className="rounded-2xl bg-olive p-4 text-white shadow-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
                      <Sparkles className="h-3 w-3" />
                      YOUR TOP MATCH
                    </span>
                    <h3 className="mt-2 text-lg font-bold">{topRecommendation.hobby}</h3>
                    <p className="mt-0.5 text-xs text-white/85">
                      {topRecommendation.matchScore}% match · {topRecommendation.difficulty} ·{' '}
                      {topRecommendation.timeCommitment}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-white/90">
                      {topRecommendation.reasoning}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/quiz')}
                      className="mt-3 w-full rounded-xl bg-white py-2 text-xs font-semibold text-olive transition-colors hover:bg-cream"
                    >
                      Retake the quiz
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-surface p-4 shadow-sm">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-olive">
                      <Sparkles className="h-3.5 w-3.5" />
                      Your AI Match
                    </span>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      Discover your perfect hobby
                    </p>
                    <p className="mt-1 text-xs text-taupe">
                      Take our 2-minute quiz to get matches picked just for you.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/quiz')}
                      className="mt-3 w-full rounded-xl bg-terracotta py-2 text-xs font-semibold text-white transition-colors hover:bg-terracotta-dark"
                    >
                      Take the Quiz →
                    </button>
                  </div>
                )}

                {/* Quick stats */}
                <div className="rounded-2xl bg-surface p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-ink">Your progress</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-amber-100 p-2.5">
                      <p className="text-lg font-bold text-amber-700">{streak}</p>
                      <p className="text-[10px] font-medium text-amber-700/80">day streak</p>
                    </div>
                    <div className="rounded-xl bg-terracotta/10 p-2.5">
                      <p className="text-lg font-bold text-terracotta">{activeJourneysCount}</p>
                      <p className="text-[10px] font-medium text-terracotta/80">active</p>
                    </div>
                    <div className="rounded-xl bg-olive/10 p-2.5">
                      <p className="text-lg font-bold text-olive">{savedHobbyIds.length}</p>
                      <p className="text-[10px] font-medium text-olive/80">saved</p>
                    </div>
                  </div>
                </div>

                {/* Trending near you - compact list */}
                <div className="rounded-2xl bg-surface p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Trending near you</h3>
                    <span className="text-[11px] text-taupe">Dubai</span>
                  </div>
                  <div className="space-y-3">
                    {trendingHobbies.map((hobby) => (
                      <div
                        key={hobby.id}
                        onClick={() => navigate(`/hobby/${hobby.id}`)}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <img
                          src={hobby.imageUrl}
                          alt={hobby.title}
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">{hobby.title}</p>
                          <p className="truncate text-[11px] capitalize text-taupe">
                            {hobby.difficulty}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-olive">
                          {Math.round(hobby.rating * 20)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Trending this week - full width */}
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">Trending this week</h2>
              <button
                type="button"
                onClick={() => showToast('Full trending list coming soon')}
                className="text-sm font-medium text-terracotta"
              >
                See all
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {trendingHobbies.map((hobby) => (
                <TrendingHobbyCard key={hobby.id} hobby={hobby} onNavigate={navigate} variant="grid" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
