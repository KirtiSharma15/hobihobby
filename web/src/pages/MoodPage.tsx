import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMood } from '@/hooks/useMood';
import type { MoodType } from '@/store/slices/moodSlice';

interface MoodOption {
  mood: MoodType;
  emoji: string;
  label: string;
}

const MOODS: MoodOption[] = [
  { mood: 'stressed', emoji: '😤', label: 'Stressed' },
  { mood: 'happy', emoji: '😊', label: 'Happy' },
  { mood: 'bored', emoji: '😑', label: 'Bored' },
  { mood: 'tired', emoji: '😴', label: 'Tired' },
  { mood: 'energetic', emoji: '⚡', label: 'Energetic' },
  { mood: 'sad', emoji: '😢', label: 'Sad' },
  { mood: 'anxious', emoji: '😰', label: 'Anxious' },
  { mood: 'creative', emoji: '🎨', label: 'Creative' },
  { mood: 'social', emoji: '🤝', label: 'Social' },
  { mood: 'focused', emoji: '🎯', label: 'Focused' },
];

const INTENSITY_OPTIONS: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

const TIME_OPTIONS: Array<{ label: string; minutes: number }> = [
  { label: '15 mins', minutes: 15 },
  { label: '30 mins', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2+ hours', minutes: 120 },
];

const slugify = (name: string): string =>
  name.toLowerCase().trim().replace(/\s+/g, '-');

const MoodPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentMood,
    intensity,
    availableTime,
    result,
    isLoading,
    error,
    selectMood,
    selectIntensity,
    selectTime,
    getRecommendations,
    clearMood,
  } = useMood();

  const selectedMoodOption = MOODS.find((m) => m.mood === currentMood);

  // STATE 3: Results
  if (result && selectedMoodOption) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 md:max-w-4xl">
        <div className="relative text-center">
          <button
            type="button"
            onClick={clearMood}
            aria-label="Back to mood selection"
            className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-[#E8E0D5]/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <p className="text-3xl" aria-hidden>
            {selectedMoodOption.emoji}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[#2C1810]">
            {selectedMoodOption.label}
          </h1>
          <p className="mt-2 text-center text-sm italic text-[#6B5B52]">
            {result.moodInsight}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:grid md:grid-cols-3">
          {result.recommendations.map((rec) => (
            <div
              key={`${rec.hobbyName}-${rec.activity}`}
              className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl" aria-hidden>
                  {rec.emoji}
                </span>
                <span className="rounded-full bg-[#F5F0E8] px-2 py-0.5 text-xs text-[#6B5B52]">
                  {rec.duration}
                </span>
              </div>

              <h2 className="mt-2 font-bold text-[#2C1810]">{rec.hobbyName}</h2>
              <p className="mt-1 text-sm font-medium text-[#2C1810]">{rec.activity}</p>
              <p className="mt-1 text-xs italic text-[#6B5B52]">{rec.reason}</p>

              {rec.isFromJourney && (
                <span className="mt-2 inline-block rounded-full bg-[#6B7C3A]/10 px-2 py-0.5 text-xs text-[#6B7C3A]">
                  📅 Day {rec.journeyDay} of your journey
                </span>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    const hobbyPath = slugify(rec.hobbyName);
                    navigate(
                      rec.isFromJourney
                        ? `/hobby/${hobbyPath}/journey`
                        : `/hobby/${hobbyPath}`
                    );
                  }}
                  className="flex-1 rounded-2xl bg-[#C4522A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C4522A]/90"
                >
                  Start now →
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/coach')}
                  className="flex-1 rounded-2xl border-2 border-[#C4522A] px-4 py-2.5 text-sm font-semibold text-[#C4522A] transition-colors hover:bg-[#C4522A]/5"
                >
                  Ask Coach
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-[#DC2626]">{error}</p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={clearMood}
            className="text-sm font-medium text-[#6B5B52] transition-colors hover:text-[#C4522A]"
          >
            Try a different mood
          </button>
          <button
            type="button"
            onClick={() => {
              void getRecommendations();
            }}
            disabled={isLoading}
            className="text-sm font-medium text-[#6B5B52] transition-colors hover:text-[#C4522A] disabled:opacity-50"
          >
            {isLoading ? 'Finding activities...' : 'Get new suggestions'}
          </button>
        </div>
      </div>
    );
  }

  // STATE 1 & 2: Mood selection (+ customisation when mood selected)
  return (
    <div className="mx-auto max-w-lg px-4 py-8 text-center">
      <h1 className="text-3xl font-bold text-[#2C1810]">How are you feeling?</h1>
      <p className="text-lg italic text-[#C4522A]">right now</p>
      <p className="mt-2 text-sm text-[#6B5B52]">
        Get hobby suggestions matched to your mood
      </p>

      {currentMood && (
        <div className="mt-8 space-y-6 text-left">
          <div>
            <p className="mb-3 font-medium text-[#2C1810]">
              How intense is this feeling?
            </p>
            <div className="flex flex-wrap gap-2">
              {INTENSITY_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectIntensity(value)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors',
                    intensity === value
                      ? 'bg-[#C4522A] text-white'
                      : 'border border-[#E8E0D5] bg-white text-[#6B5B52]'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-medium text-[#2C1810]">
              How much time do you have?
            </p>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.minutes}
                  type="button"
                  onClick={() => selectTime(option.minutes)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    availableTime === option.minutes
                      ? 'bg-[#C4522A] text-white'
                      : 'border border-[#E8E0D5] bg-white text-[#6B5B52]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void getRecommendations();
            }}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C4522A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C4522A]/90 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Finding activities...
              </>
            ) : (
              'Find my perfect activity →'
            )}
          </button>

          {error && (
            <p className="text-center text-sm text-[#DC2626]">{error}</p>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-5 gap-3">
        {MOODS.map(({ mood, emoji, label }) => {
          const isSelected = currentMood === mood;
          return (
            <button
              key={mood}
              type="button"
              onClick={() => selectMood(mood)}
              className={cn(
                'cursor-pointer rounded-2xl border-2 bg-[#FFFCF7] p-3 text-center transition-colors',
                isSelected
                  ? 'border-[#C4522A] bg-[#C4522A]/5'
                  : 'border-transparent hover:border-[#C4522A]/30'
              )}
            >
              <span className="text-2xl" aria-hidden>
                {emoji}
              </span>
              <p className="mt-1 text-xs font-medium text-[#2C1810]">{label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodPage;
