import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import { useSaveHobby } from '@/hooks/useSaveHobby';
import { useAppSelector } from '@/hooks/useAppDispatch';
import type { Hobby } from '@shared/types';
import type { RootState } from '@/store';

interface HobbyCardProps {
  hobby: Hobby;
  onClick?: () => void;
}

const HeartIcon: React.FC<{ filled: boolean; className?: string }> = ({
  filled,
  className,
}) => (
  <svg
    className={cn('w-5 h-5', className)}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

export const HobbyCard: React.FC<HobbyCardProps> = ({ hobby, onClick }) => {
  const navigate = useNavigate();
  const { isSaved, toggleSave, isLoading } = useSaveHobby(hobby.id);
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/hobby/${hobby.id}`);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Sign in to save hobbies');
      return;
    }
    toggleSave();
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  return (
    <Card hover onClick={handleClick} className="h-full relative">
      <button
        type="button"
        onClick={handleSaveClick}
        disabled={isLoading}
        aria-label={isSaved ? 'Remove from saved' : 'Save hobby'}
        className={cn(
          'absolute top-3 right-3 z-10',
          'w-9 h-9 flex items-center justify-center rounded-full',
          'bg-white/90 shadow-sm backdrop-blur-sm',
          'transition-colors hover:bg-white',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          isSaved ? 'text-red-500' : 'text-gray-400 hover:text-red-400',
          isLoading && 'cursor-wait'
        )}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="!flex" />
        ) : (
          <HeartIcon filled={isSaved} />
        )}
      </button>

      {hobby.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={hobby.imageUrl}
            alt={hobby.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 min-w-0 pr-8">
            {hobby.title}
          </h3>
          {hobby.difficulty && (
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0',
                difficultyColors[hobby.difficulty]
              )}
            >
              {hobby.difficulty}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {hobby.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            {hobby.category}
          </span>

          {hobby.rating && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{hobby.rating}</span>
              {hobby.reviewCount && (
                <span className="text-xs text-gray-500">({hobby.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {hobby.tags && hobby.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {hobby.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
