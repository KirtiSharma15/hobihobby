import React from 'react';
import { cn } from '@/utils/cn';

export interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<StreakBadgeProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, size = 'md' }) => {
  if (streak === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-[#F59E0B]/10 font-semibold text-[#F59E0B]',
        SIZE_CLASSES[size]
      )}
    >
      🔥 {streak}
    </span>
  );
};

export default StreakBadge;
