import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface JourneyDay {
  day: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  tip: string;
}

export interface Journey {
  hobbyId: string;
  hobbyName: string;
  startedAt: string;
  currentDay: number;
  lastActivityAt: string;
  streak: number;
  longestStreak: number;
  completedDays: number[];
  milestones: string[];
  totalDays: number;
}

interface JourneyState {
  activeJourneys: Record<string, Journey>;
  currentTemplate: JourneyDay[] | null;
  weeklyPlan: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: JourneyState = {
  activeJourneys: {},
  currentTemplate: null,
  weeklyPlan: null,
  isLoading: false,
  error: null,
};

const journeySlice = createSlice({
  name: 'journey',
  initialState,
  reducers: {
    setJourney: (state, action: PayloadAction<Journey>) => {
      state.activeJourneys[action.payload.hobbyId] = action.payload;
    },
    updateStreak: (
      state,
      action: PayloadAction<{ hobbyId: string; streak: number }>
    ) => {
      const journey = state.activeJourneys[action.payload.hobbyId];
      if (journey) journey.streak = action.payload.streak;
    },
    addCompletedDay: (
      state,
      action: PayloadAction<{ hobbyId: string; day: number }>
    ) => {
      const journey = state.activeJourneys[action.payload.hobbyId];
      if (journey && !journey.completedDays.includes(action.payload.day)) {
        journey.completedDays.push(action.payload.day);
        journey.currentDay = action.payload.day + 1;
      }
    },
    addMilestone: (
      state,
      action: PayloadAction<{ hobbyId: string; milestone: string }>
    ) => {
      const journey = state.activeJourneys[action.payload.hobbyId];
      if (journey && !journey.milestones.includes(action.payload.milestone)) {
        journey.milestones.push(action.payload.milestone);
      }
    },
    setCurrentTemplate: (state, action: PayloadAction<JourneyDay[]>) => {
      state.currentTemplate = action.payload;
    },
    setWeeklyPlan: (state, action: PayloadAction<any>) => {
      state.weeklyPlan = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setJourney,
  updateStreak,
  addCompletedDay,
  addMilestone,
  setCurrentTemplate,
  setWeeklyPlan,
  setLoading,
  setError,
} = journeySlice.actions;

export const journeyReducer = journeySlice.reducer;
export default journeyReducer;