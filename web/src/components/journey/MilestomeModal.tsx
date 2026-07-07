import React from 'react';
import { Trophy } from 'lucide-react';

export interface MilestoneModalProps {
  milestone: string | null;
  onDismiss: () => void;
}

const MILESTONE_TITLES: Record<string, string> = {
  first_day: 'First Day Complete! 🎉',
  three_day_streak: '3-Day Streak! 🔥',
  week_streak: 'One Week Strong! 💪',
  month_streak: '30-Day Legend! 🏆',
  ten_days: '10 Days In! ⭐',
  thirty_days: '30 Days Complete! 🌟',
};

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone, onDismiss }) => {
  if (!milestone) return null;

  const title = MILESTONE_TITLES[milestone] ?? milestone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <Trophy size={64} className="mx-auto text-[#F59E0B]" />
        <h3 className="mt-4 text-xl font-bold text-[#2C1810]">{title}</h3>
        <p className="mt-2 text-sm text-[#6B5B52]">You're building a real habit</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-2xl bg-[#C4522A] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A8431F]"
        >
          Keep going! →
        </button>
      </div>
    </div>
  );
};

export default MilestoneModal;
