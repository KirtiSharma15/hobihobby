import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CoachAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showOnlineDot?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<CoachAvatarProps['size']>, string> = {
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-10 w-10 rounded-2xl',
  lg: 'h-16 w-16 rounded-3xl',
};

const ICON_SIZES: Record<NonNullable<CoachAvatarProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

export const CoachAvatar: React.FC<CoachAvatarProps> = ({ size = 'md', showOnlineDot, className }) => (
  <div className={cn('relative flex shrink-0 items-center justify-center bg-terracotta shadow-sm', SIZES[size], className)}>
    <Sparkles className={cn('text-white', ICON_SIZES[size])} />
    {showOnlineDot && (
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-olive" />
    )}
  </div>
);

export default CoachAvatar;
