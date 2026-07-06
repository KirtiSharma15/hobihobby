import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Star, Heart } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppDispatch';
import { useSaveHobby } from '../hooks/useSaveHobby';
import { HobbyRecommendation } from '../store/slices/aiSlice';
import { cn } from '../utils/cn';

const slugify = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '-');

const getDifficultyStyle = (difficulty: string) => {
  const d = difficulty.toLowerCase();
  if (d.includes('advanced')) return 'bg-terracotta/10 text-terracotta';
  if (d.includes('intermediate')) return 'bg-amber-100 text-amber-700';
  return 'bg-olive/10 text-olive';
};

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

interface StatChipProps {
  tone?: 'olive' | 'neutral';
  children: React.ReactNode;
}

const StatChip: React.FC<StatChipProps> = ({ tone = 'neutral', children }) => (
  <span
    className={cn(
      'rounded-full px-3 py-1 text-xs font-semibold',
      tone === 'olive' ? 'bg-olive/10 text-olive' : 'border border-border bg-surface text-ink'
    )}
  >
    {children}
  </span>
);

interface CardProps {
  rec: HobbyRecommendation;
  index: number;
}

const TopPickCard: React.FC<CardProps> = ({ rec, index }) => {
  const hobbyId = slugify(rec.hobby);
  const { isSaved, toggleSave } = useSaveHobby(hobbyId);
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-terracotta/20 bg-surface shadow-sm">
      <div
        onClick={() => navigate(`/hobby/${hobbyId}`)}
        className={cn('relative h-40 cursor-pointer bg-gradient-to-br', THUMB_TINTS[index % THUMB_TINTS.length])}
        style={STRIPE_STYLE}
      >
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-terracotta px-3 py-1 text-xs font-bold text-white">
          <Star className="h-3 w-3 fill-white" />
          TOP PICK
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSave();
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save hobby'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface shadow-md transition-transform hover:scale-105"
        >
          <Heart className={cn('h-4 w-4', isSaved ? 'fill-terracotta text-terracotta' : 'text-ink')} />
        </button>
        <span className="absolute bottom-3 left-3 font-mono text-xs text-ink/40">
          [ {rec.category.toLowerCase()} ]
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-ink">{rec.hobby}</h2>
          <div className="shrink-0 text-right">
            <p className="text-4xl font-bold leading-none text-terracotta">
              {rec.matchScore}
              <span className="text-base">%</span>
            </p>
            <p className="mt-1 text-xs text-taupe">match score</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatChip tone="olive">{rec.difficulty}</StatChip>
          <StatChip>{rec.timeCommitment}</StatChip>
          <StatChip>{rec.estimatedCost}</StatChip>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-terracotta/5 p-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-semibold">Why this fits: </span>
            <span className="italic text-taupe">{rec.reasoning}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/hobby/${hobbyId}`)}
          className="mt-4 w-full rounded-2xl bg-terracotta py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
        >
          Start with {rec.hobby} →
        </button>
      </div>
    </div>
  );
};

const StandardCard: React.FC<CardProps> = ({ rec, index }) => {
  const hobbyId = slugify(rec.hobby);
  const { isSaved, toggleSave } = useSaveHobby(hobbyId);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/hobby/${hobbyId}`)}
      className="flex cursor-pointer gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div
        className={cn(
          'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br',
          THUMB_TINTS[index % THUMB_TINTS.length]
        )}
        style={STRIPE_STYLE}
      >
        <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-ink/80 text-xs font-bold text-white">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight text-ink">{rec.hobby}</h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save hobby'}
            className="shrink-0 text-taupe transition-colors hover:text-terracotta"
          >
            <Heart className={cn('h-5 w-5', isSaved ? 'fill-terracotta text-terracotta' : '')} />
          </button>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="font-semibold text-olive">{rec.matchScore}% match</span>
          <span className="text-taupe">·</span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getDifficultyStyle(rec.difficulty))}>
            {rec.difficulty}
          </span>
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-taupe">{rec.reasoning}</p>
      </div>
    </div>
  );
};

const QuizResultsPage: React.FC = () => {
  const recommendations = useAppSelector((state) => state.ai.recommendations);
  const profile = useAppSelector((state) => state.user.profile);
  const navigate = useNavigate();
  const firstName = profile?.displayName?.split(' ')[0] || 'there';
  const topPick = recommendations[0];
  const topPickId = topPick ? slugify(topPick.hobby) : '';

  if (recommendations.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 font-jakarta text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-terracotta/10">
          <Sparkles className="h-10 w-10 text-terracotta" />
        </div>
        <h1 className="text-xl font-bold text-ink">No matches yet</h1>
        <p className="mt-2 max-w-xs text-sm text-taupe">
          Take the quiz to get AI-matched hobby recommendations picked just for you.
        </p>
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="mt-6 rounded-2xl bg-terracotta px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
        >
          Take the Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-40 font-jakarta lg:pb-16">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/explore')}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-sm transition-colors hover:bg-border/40"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="text-sm font-medium text-taupe transition-colors hover:text-ink"
          >
            Retake quiz
          </button>
        </div>

        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-olive">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-olive text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          Your matches are in
        </span>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-ink">
          {recommendations.length} hobbies made for you, {firstName}
        </h1>
        <p className="mt-2 text-sm text-taupe">
          Ranked by how well they fit your time, budget and personality.
        </p>

        {/* Recommendation cards */}
        <div className="mt-6 flex flex-col gap-3">
          {topPick && <TopPickCard rec={topPick} index={0} />}

          {recommendations.length > 1 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {recommendations.slice(1).map((rec, index) => (
                <StandardCard key={rec.hobby} rec={rec} index={index + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-taupe transition-colors hover:border-terracotta/50 hover:text-ink"
          >
            Retake Quiz
          </button>
          <button
            type="button"
            onClick={() => navigate('/coach')}
            className="flex-1 rounded-2xl bg-terracotta py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
          >
            Ask HobiCoach
          </button>
        </div>
      </div>

      {/* Sticky bottom bar - quick access to top pick */}
      {topPick && (
        <div className="fixed inset-x-0 bottom-16 z-30 flex gap-3 border-t border-border bg-surface p-4 lg:bottom-0">
          <TopPickQuickSave hobbyId={topPickId} />
          <button
            type="button"
            onClick={() => navigate(`/hobby/${topPickId}`)}
            className="flex-1 rounded-2xl bg-terracotta py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
          >
            Start with top pick →
          </button>
        </div>
      )}
    </div>
  );
};

const TopPickQuickSave: React.FC<{ hobbyId: string }> = ({ hobbyId }) => {
  const { isSaved, toggleSave } = useSaveHobby(hobbyId);
  return (
    <button
      type="button"
      onClick={toggleSave}
      aria-label={isSaved ? 'Remove from saved' : 'Save top pick'}
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors',
        isSaved ? 'bg-terracotta/10 text-terracotta' : 'bg-cream text-taupe hover:text-terracotta'
      )}
    >
      <Heart className={cn('h-5 w-5', isSaved && 'fill-terracotta')} />
    </button>
  );
};

export default QuizResultsPage;
