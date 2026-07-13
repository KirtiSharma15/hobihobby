/**
 * Community Page - Artisan Theme (Sprint 4, Local Discovery)
 *
 * Browse Community Circles — small groups by hobby + skill level + location.
 * Circles are hardcoded demo data for now; Firestore-backed circles (create,
 * join, membership counts) land in a later sprint per ROADMAP.md.
 */

import React, { useState } from 'react';
import { Users, MapPin, Check } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { showToast } from '@/utils/toast';
import { cn } from '@/utils/cn';

type Skill = 'Beginner' | 'Intermediate' | 'Advanced' | 'All levels';

interface Circle {
  id: string;
  name: string;
  hobby: string;
  emoji: string;
  members: number;
  skill: Skill;
  location: string;
  color: string;
}

const DEMO_CIRCLES: Circle[] = [
  {
    id: '1',
    name: 'Beginner Painters Abu Dhabi',
    hobby: 'Painting',
    emoji: '🎨',
    members: 24,
    skill: 'Beginner',
    location: 'Abu Dhabi',
    color: '#C4522A',
  },
  {
    id: '2',
    name: 'Weekend Photographers Dubai',
    hobby: 'Photography',
    emoji: '📸',
    members: 31,
    skill: 'All levels',
    location: 'Dubai',
    color: '#6B7C3A',
  },
  {
    id: '3',
    name: 'Pottery Collective Abu Dhabi',
    hobby: 'Pottery',
    emoji: '🏺',
    members: 18,
    skill: 'Beginner',
    location: 'Abu Dhabi',
    color: '#F59E0B',
  },
  {
    id: '4',
    name: 'Watercolour Artists Dubai',
    hobby: 'Painting',
    emoji: '🖌️',
    members: 42,
    skill: 'Intermediate',
    location: 'Dubai',
    color: '#6B7C3A',
  },
  {
    id: '5',
    name: 'Running Club Abu Dhabi',
    hobby: 'Running',
    emoji: '🏃',
    members: 67,
    skill: 'All levels',
    location: 'Abu Dhabi',
    color: '#C4522A',
  },
  {
    id: '6',
    name: 'Chess Enthusiasts UAE',
    hobby: 'Chess',
    emoji: '♟️',
    members: 29,
    skill: 'Intermediate',
    location: 'UAE',
    color: '#2C1810',
  },
];

const SKILL_BADGE_STYLES: Record<Skill, string> = {
  Beginner: 'bg-olive/10 text-olive',
  Intermediate: 'bg-amber-500/10 text-amber-600',
  Advanced: 'bg-terracotta/10 text-terracotta',
  'All levels': 'bg-border text-taupe',
};

interface CircleCardProps {
  circle: Circle;
  isJoined: boolean;
  onToggleJoin: (circleId: string) => void;
}

const CircleCard: React.FC<CircleCardProps> = ({ circle, isJoined, onToggleJoin }) => (
  <div className="w-[220px] shrink-0 rounded-2xl bg-surface p-4 shadow-sm md:w-full">
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
      style={{ backgroundColor: `${circle.color}1A` }}
    >
      {circle.emoji}
    </div>

    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-ink">{circle.name}</h3>

    <p className="mt-1 flex items-center gap-1 text-xs text-taupe">
      <Users className="h-3.5 w-3.5" />
      {circle.members} members
    </p>

    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[11px] font-medium',
          SKILL_BADGE_STYLES[circle.skill]
        )}
      >
        {circle.skill}
      </span>
      <span className="flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-taupe">
        <MapPin className="h-3 w-3" />
        {circle.location}
      </span>
    </div>

    <button
      type="button"
      onClick={() => onToggleJoin(circle.id)}
      className={cn(
        'mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2 text-sm font-semibold transition-colors',
        isJoined
          ? 'bg-olive text-white hover:bg-olive-dark'
          : 'border-2 border-terracotta text-terracotta hover:bg-terracotta/5'
      )}
    >
      {isJoined ? (
        <>
          <Check className="h-4 w-4" />
          Joined
        </>
      ) : (
        'Join'
      )}
    </button>
  </div>
);

export const CommunityPage: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const [joinedCircleIds, setJoinedCircleIds] = useState<string[]>([]);

  const handleToggleJoin = (circleId: string) => {
    if (!isAuthenticated) {
      showToast('Sign in to join a circle');
      return;
    }

    setJoinedCircleIds((prev) =>
      prev.includes(circleId) ? prev.filter((id) => id !== circleId) : [...prev, circleId]
    );
  };

  const handleCreateCircle = () => {
    showToast('Creating your own circle is coming soon!');
  };

  const handleSeeAll = () => {
    showToast('Full circles list coming soon');
  };

  return (
    <div className="min-h-screen bg-cream pb-24 font-jakarta md:pb-12">
      <div className="mx-auto max-w-6xl px-5 pt-6 md:px-8 md:pt-10">
        {/* Header */}
        <header className="pb-6 md:pb-8">
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Community</h1>
          <p className="mt-1 text-sm text-taupe">Find your people</p>
        </header>

        {/* Featured circles */}
        <section className="pb-8">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-bold text-ink">Near you</h2>
            <button
              type="button"
              onClick={handleSeeAll}
              className="text-sm font-medium text-terracotta"
            >
              See all
            </button>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible"
            style={{ scrollbarWidth: 'none' }}
          >
            {DEMO_CIRCLES.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                isJoined={joinedCircleIds.includes(circle.id)}
                onToggleJoin={handleToggleJoin}
              />
            ))}
          </div>
        </section>

        {/* Create circle CTA */}
        <section className="pb-10">
          <div className="rounded-2xl bg-terracotta/10 p-6 text-center">
            <h3 className="text-lg font-semibold text-ink">Start your own circle</h3>
            <p className="mt-1 text-sm text-taupe">Connect with people who share your passion</p>
            <button
              type="button"
              onClick={handleCreateCircle}
              className="mt-5 rounded-2xl bg-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              Create Circle
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunityPage;
