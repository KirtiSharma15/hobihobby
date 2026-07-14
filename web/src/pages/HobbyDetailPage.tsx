/**
 * Hobby Detail Page - Artisan Theme
 *
 * Shows comprehensive hobby information: hero, stats, about, starter kit,
 * a preview of the 365-day journey, nearby classes, and tutorials.
 * Features:
 * - What it is (description) + who it's for (personality fit)
 * - Starter checklist with costs
 * - First 3 beginner steps, previewed as a Day 1-3 journey teaser
 * - Intro video link
 * - Local save functionality
 * - Link to structured learning path
 *
 * Mobile renders an immersive full-bleed hero with floating back/share/save
 * controls. Desktop renders a breadcrumb + contained hero in a 60% content
 * column, with a 40% sticky sidebar holding all primary actions.
 *
 * Hobby data is loaded from Firestore via useHobbies.fetchHobbyById.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Lock,
  Loader2,
  Play,
  MapPin,
  Star,
  Sparkles,
  CircleDot,
  Wrench,
  Droplet,
  Settings2,
} from 'lucide-react';
import { useLocalSavedHobbies } from '@/hooks/useLocalSavedHobbies';
import { useJourney } from '@/hooks/useJourney';
import { useHobbies } from '@/hooks/useHobbies';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import { trackHobbyView, trackHobbySave, trackTimeOnPage } from '@/utils/analytics';
import type { Hobby } from '@/store/slices/hobbiesSlice';

interface NearbyClass {
  name: string;
  distanceKm: number;
  neighborhood: string;
  note: string;
  rating: number;
}

interface Tutorial {
  title: string;
  duration: string;
  onClick: () => void;
}

/** Generic Day 1–3 teaser when a journey template exists but step copy isn't on the hobby doc. */
const JOURNEY_TEASER: Array<{
  day: number;
  title: string;
  duration?: string;
  unlockLabel?: string;
}> = [
  { day: 1, title: 'Get set up & try day one', duration: '~20 min · watch + try' },
  { day: 2, title: 'Build your first habit', unlockLabel: 'Day 2 · unlocks after Day 1' },
  { day: 3, title: 'Keep the streak going', unlockLabel: 'Day 3' },
];

const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(44,24,16,0.08) 0px, rgba(44,24,16,0.08) 10px, transparent 10px, transparent 20px)',
};

const CHIP_ICONS = [Sparkles, CircleDot, Wrench, Droplet, Settings2];

/** Turns a verbose checklist entry into a short, chip-friendly label. */
const shortenChecklistLabel = (item: string): string =>
  item
    .replace(/\s*\([^)]*\)/g, '')
    .split(/\s+(?:and|or)\s+/i)[0]
    .trim();

const DIFFICULTY_TONE: Record<Hobby['difficulty'], string> = {
  beginner: 'bg-olive/10 text-olive',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-terracotta/10 text-terracotta',
};

interface StatPillProps {
  label: string;
  value: string;
  tone?: Hobby['difficulty'] | 'default';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, tone = 'default' }) => (
  <div
    className={cn(
      'flex flex-col items-center gap-0.5 rounded-xl px-2 py-3 text-center',
      tone === 'default' ? 'border border-border bg-surface text-ink' : DIFFICULTY_TONE[tone]
    )}
  >
    <span className="truncate text-sm font-bold capitalize">{value}</span>
    <span className="text-[11px] opacity-70">{label}</span>
  </div>
);

const NearbyClassCard: React.FC<{ venue: NearbyClass; tint: string }> = ({ venue, tint }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
    <div className={cn('h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br', tint)} style={STRIPE_STYLE} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-ink">{venue.name}</p>
      <p className="truncate text-xs text-taupe">
        {venue.distanceKm} km · {venue.neighborhood} · {venue.note}
      </p>
    </div>
    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink">
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      {venue.rating}
    </span>
  </div>
);

const NEARBY_TINTS = ['from-terracotta/25 to-terracotta/5', 'from-olive/25 to-olive/10', 'from-rose-400/25 to-rose-300/10'];

const NearbyClassesSection: React.FC<{ venues: NearbyClass[] }> = ({ venues }) => {
  if (venues.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Nearby classes</h2>
        <button
          type="button"
          onClick={() => showToast('The hobby map is launching in a future update')}
          className="text-sm font-medium text-terracotta"
        >
          Map
        </button>
      </div>
      <div className="space-y-3">
        {venues.map((venue, index) => (
          <NearbyClassCard key={venue.name} venue={venue} tint={NEARBY_TINTS[index % NEARBY_TINTS.length]} />
        ))}
      </div>
    </section>
  );
};

const AboutSection: React.FC<{ description: string }> = ({ description }) => (
  <section>
    <h2 className="mb-3 text-xl font-semibold text-ink">About</h2>
    <p className="text-sm leading-relaxed text-taupe">{description}</p>
  </section>
);

const WhatYouNeedSection: React.FC<{
  starterKit: string[];
  displayStarterCost: string;
}> = ({ starterKit, displayStarterCost }) => (
  <section>
    <h2 className="mb-3 text-xl font-semibold text-ink">What you&apos;ll need</h2>
    <div className="mb-4 flex flex-wrap gap-2">
      {starterKit.map((item, index) => {
        const ChipIcon = CHIP_ICONS[index % CHIP_ICONS.length];
        return (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink"
          >
            <ChipIcon className="h-3.5 w-3.5 text-olive" />
            {shortenChecklistLabel(item)}
          </span>
        );
      })}
    </div>
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-terracotta/10 p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-terracotta-dark">Complete starter kit</p>
      </div>
      <button
        type="button"
        onClick={() => showToast('Shopping list coming soon')}
        className="shrink-0 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
      >
        Shop · {displayStarterCost}
      </button>
    </div>
  </section>
);

const JourneySection: React.FC<{
  showCta?: boolean;
  onStartJourney: () => void;
  isStartingJourney: boolean;
}> = ({ showCta = true, onStartJourney, isStartingJourney }) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-ink">Your 365-day journey</h2>
      <span className="text-xs font-medium text-taupe">AI-guided</span>
    </div>

    <div className="divide-y divide-border rounded-2xl bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-4 pb-4">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-terracotta text-white">
          <span className="text-[9px] font-semibold uppercase leading-none">Day</span>
          <span className="text-base font-bold leading-none">1</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{JOURNEY_TEASER[0].title}</p>
          <p className="text-xs text-taupe">{JOURNEY_TEASER[0].duration}</p>
        </div>
      </div>

      {JOURNEY_TEASER.slice(1).map((step) => (
        <div key={step.day} className="flex items-center gap-4 pt-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-border">
            <Lock className="h-4 w-4 text-taupe" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-taupe">{step.title}</p>
            <p className="text-xs text-taupe/70">{step.unlockLabel}</p>
          </div>
        </div>
      ))}
    </div>

    <p className="mt-3 text-center text-xs text-taupe">+ 362 more days, paced for you</p>

    {showCta && (
      <button
        type="button"
        onClick={onStartJourney}
        disabled={isStartingJourney}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta/10 py-3 text-center text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isStartingJourney ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span>Start Journey →</span>
        )}
      </button>
    )}
  </section>
);

const TutorialCard: React.FC<{ tutorial: Tutorial; imageUrl: string; className?: string }> = ({
  tutorial,
  imageUrl,
  className,
}) => (
  <div onClick={tutorial.onClick} className={cn('cursor-pointer', className)}>
    <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-border">
      {imageUrl ? (
        <img src={imageUrl} alt={tutorial.title} className="h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
          <Play className="ml-0.5 h-3.5 w-3.5 fill-terracotta text-terracotta" />
        </span>
      </div>
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {tutorial.duration}
      </span>
    </div>
    <p className="mt-2 line-clamp-2 text-sm font-medium text-ink">{tutorial.title}</p>
    <p className="text-xs text-taupe">HobiHobby · Studio</p>
  </div>
);

const TutorialsSection: React.FC<{
  tutorials: Tutorial[];
  imageUrl: string;
  layout: 'scroll' | 'grid';
}> = ({ tutorials, imageUrl, layout }) => {
  if (tutorials.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-ink">Tutorials</h2>
      <div
        className={
          layout === 'scroll'
            ? 'flex gap-4 overflow-x-auto pb-1'
            : 'grid grid-cols-3 gap-4'
        }
      >
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={tutorial.title}
            tutorial={tutorial}
            imageUrl={imageUrl}
            className={layout === 'scroll' ? 'w-44 shrink-0' : undefined}
          />
        ))}
      </div>
    </section>
  );
};

const HobbyDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-cream pb-40 font-jakarta lg:pb-16">
    <div className="lg:hidden">
      <div className="h-64 w-full animate-pulse bg-border" />
      <div className="space-y-4 px-4 pt-8 sm:px-6">
        <div className="h-8 w-2/3 animate-pulse rounded bg-border" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 animate-pulse rounded-xl bg-border" />
          <div className="h-16 animate-pulse rounded-xl bg-border" />
          <div className="h-16 animate-pulse rounded-xl bg-border" />
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-border" />
        <div className="h-32 animate-pulse rounded-2xl bg-border" />
      </div>
    </div>
    <div className="mx-auto hidden max-w-6xl px-8 pt-6 lg:block">
      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-border" />
      <div className="flex gap-10">
        <div className="w-[60%] space-y-6">
          <div className="h-80 w-full animate-pulse rounded-2xl bg-border" />
          <div className="h-8 w-1/2 animate-pulse rounded bg-border" />
          <div className="h-24 animate-pulse rounded-2xl bg-border" />
        </div>
        <div className="w-[40%]">
          <div className="h-64 animate-pulse rounded-2xl bg-border" />
        </div>
      </div>
    </div>
  </div>
);

const HeroImage: React.FC<{ hobby: Hobby; className?: string }> = ({ hobby, className }) =>
  hobby.imageUrl ? (
    <img src={hobby.imageUrl} alt={hobby.name} className={cn('h-full w-full object-cover', className)} />
  ) : (
    <div className={cn('flex h-full w-full items-center justify-center bg-border text-6xl', className)}>
      {hobby.emoji}
    </div>
  );

export const HobbyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const { startJourney } = useJourney();
  const { fetchHobbyById, isLoading: catalogLoading, error: catalogError } = useHobbies();
  const hobby = useAppSelector((state) => state.hobbies.currentHobby);
  const startTimeRef = useRef<number>(Date.now());
  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!id) {
      setHasFetched(true);
      return;
    }

    let cancelled = false;
    setHasFetched(false);

    void fetchHobbyById(id).finally(() => {
      if (!cancelled) setHasFetched(true);
    });

    return () => {
      cancelled = true;
    };
  }, [id, fetchHobbyById]);

  // Track page view and time spent once hobby is loaded
  useEffect(() => {
    if (!hobby) return;

    trackHobbyView(hobby.id, hobby.name);
    startTimeRef.current = Date.now();

    return () => {
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (seconds > 3) {
        trackTimeOnPage(hobby.id, seconds);
      }
    };
  }, [hobby]);

  if (catalogLoading || !hasFetched) {
    return <HobbyDetailSkeleton />;
  }

  if (!hobby || catalogError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 font-jakarta">
        <p className="text-lg font-semibold text-ink">Hobby not found</p>
        <p className="text-sm text-taupe">
          {catalogError ?? 'This hobby may have been removed or the link is incorrect.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="rounded-2xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isSaved = savedHobbies.has(hobby.id);
  const matchScore = 85;
  const displayStarterCost = `~AED ${hobby.estimatedCostAED}`;
  const learnPath = `/hobby/${hobby.id}/learn`;
  // Firestore hobby docs don't ship nearby/tutorial payloads yet — keep sections wired for empty data.
  const nearbyClasses: NearbyClass[] = [];
  const tutorials: Tutorial[] = [];

  const handleSave = () => {
    toggleSaveHobby(hobby.id);
    trackHobbySave(hobby.id, hobby.name, !isSaved);
  };

  const handleStartJourney = async () => {
    setIsStartingJourney(true);
    try {
      await startJourney(hobby.id);
      navigate(`/hobby/${hobby.id}/journey`);
    } catch {
      showToast('Failed to start journey. Please try again.');
    } finally {
      setIsStartingJourney(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: hobby.name,
      text: `Check out ${hobby.name} on HobiHobby`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet - nothing to do
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Unable to copy link');
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-cream font-jakarta lg:pb-16',
        hobby.hasLearningPath ? 'pb-40' : 'pb-24'
      )}
    >
      {/* ============================= MOBILE ============================= */}
      <div className="lg:hidden">
        {/* Hero image */}
        <div className="relative h-64 w-full overflow-hidden">
          <HeroImage hobby={hobby} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            {/* Fixed destination, not navigate(-1) — this page can be a deep-link entry point with no reliable prior history. */}
            <button
              type="button"
              onClick={() => navigate('/explore')}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md transition-colors hover:bg-surface"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md transition-colors hover:bg-surface"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs font-bold text-white">
            <Sparkles className="h-3 w-3" />
            {matchScore}% match
          </span>
        </div>

        <div className="relative -mt-4 rounded-t-3xl bg-cream px-4 pt-8 sm:px-6">
          {/* Floating save heart - straddles the hero seam */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save hobby'}
            className="absolute -top-5 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-md transition-transform hover:scale-105 sm:right-6"
          >
            <Heart className={cn('h-5 w-5', isSaved ? 'fill-terracotta text-terracotta' : 'text-ink')} />
          </button>

          <h1 className="text-3xl font-bold text-ink">{hobby.name}</h1>
          <p className="mt-1 italic text-taupe">{hobby.tagline}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatPill label="difficulty" value={hobby.difficulty} tone={hobby.difficulty} />
            <StatPill label="time" value={hobby.timePerWeek} />
            <StatPill label="starter kit" value={displayStarterCost} />
          </div>

          <div className="my-6 h-px bg-border" />

          <div className="space-y-8 pb-10">
            <AboutSection description={hobby.description} />
            <WhatYouNeedSection
              starterKit={hobby.starterKit}
              displayStarterCost={displayStarterCost}
            />
            {hobby.hasJourneyTemplate && (
              <JourneySection
                onStartJourney={handleStartJourney}
                isStartingJourney={isStartingJourney}
              />
            )}
            <NearbyClassesSection venues={nearbyClasses} />
            <TutorialsSection tutorials={tutorials} imageUrl={hobby.imageUrl} layout="scroll" />
          </div>
        </div>
      </div>

      {/* ============================= DESKTOP ============================= */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-8 pt-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <Link to="/explore" className="font-medium text-terracotta hover:underline">
              Explore
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-taupe" />
            <span className="text-taupe">{hobby.category}</span>
            <ChevronRight className="h-3.5 w-3.5 text-taupe" />
            <span className="text-taupe">{hobby.name}</span>
          </nav>

          <div className="flex items-start gap-10">
            {/* Main content - 60% */}
            <div className="w-[60%]">
              <div className="relative h-80 w-full overflow-hidden rounded-2xl">
                <HeroImage hobby={hobby} />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="h-3 w-3" />
                  {matchScore}% match
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-bold text-ink">{hobby.name}</h1>
              <p className="mt-1 italic text-taupe">{hobby.tagline}</p>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-8">
                <AboutSection description={hobby.description} />
                <WhatYouNeedSection
                  starterKit={hobby.starterKit}
                  displayStarterCost={displayStarterCost}
                />
                {hobby.hasJourneyTemplate && (
                  <JourneySection
                    showCta={false}
                    onStartJourney={handleStartJourney}
                    isStartingJourney={isStartingJourney}
                  />
                )}
                <TutorialsSection tutorials={tutorials} imageUrl={hobby.imageUrl} layout="grid" />
              </div>
            </div>

            {/* Sidebar - 40%, sticky */}
            <aside className="w-[40%]">
              <div className="sticky top-24 space-y-4">
                <div className="space-y-4 rounded-2xl bg-surface p-5 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <StatPill label="difficulty" value={hobby.difficulty} tone={hobby.difficulty} />
                    <StatPill label="time" value={hobby.timePerWeek} />
                    <StatPill label="starter" value={displayStarterCost} />
                  </div>

                  {hobby.hasJourneyTemplate && (
                    <button
                      type="button"
                      onClick={handleStartJourney}
                      disabled={isStartingJourney}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-terracotta py-3 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isStartingJourney ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>Start Journey →</span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta/10 py-3 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/15"
                  >
                    <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
                    {isSaved ? 'Saved' : 'Save hobby'}
                  </button>

                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-taupe">Complete starter kit</span>
                    <span className="font-semibold text-ink">{displayStarterCost}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex w-full items-center justify-center gap-2 text-xs font-medium text-taupe transition-colors hover:text-ink"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share this hobby
                  </button>
                </div>

                {nearbyClasses.length > 0 && (
                  <div className="rounded-2xl bg-surface p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <MapPin className="h-4 w-4 text-taupe" />
                        Nearby classes
                      </h3>
                      <button
                        type="button"
                        onClick={() => showToast('The hobby map is launching in a future update')}
                        className="text-xs font-medium text-terracotta"
                      >
                        Map
                      </button>
                    </div>
                    <div className="space-y-3">
                      {nearbyClasses.map((venue, index) => (
                        <NearbyClassCard
                          key={venue.name}
                          venue={venue}
                          tint={NEARBY_TINTS[index % NEARBY_TINTS.length]}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar - mobile only, sits above the global bottom nav */}
      {hobby.hasLearningPath && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface p-4 lg:hidden">
          <Link
            to={learnPath}
            className="block w-full rounded-2xl bg-terracotta py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
          >
            Start Learning
          </Link>
        </div>
      )}
    </div>
  );
};
