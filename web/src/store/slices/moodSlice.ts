import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MoodType =
  | 'stressed'
  | 'happy'
  | 'bored'
  | 'tired'
  | 'energetic'
  | 'sad'
  | 'anxious'
  | 'creative'
  | 'social'
  | 'focused';

export interface MoodRecommendation {
  hobbyName: string;
  activity: string;
  duration: string;
  reason: string;
  isFromJourney: boolean;
  journeyDay?: number;
  energyLevel: 'low' | 'medium' | 'high';
  emoji: string;
}

export interface MoodResult {
  mood: MoodType;
  moodInsight: string;
  recommendations: MoodRecommendation[];
  generatedAt: string;
}

interface MoodState {
  currentMood: MoodType | null;
  intensity: 'low' | 'medium' | 'high';
  availableTime: number;
  result: MoodResult | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MoodState = {
  currentMood: null,
  intensity: 'medium',
  availableTime: 30,
  result: null,
  isLoading: false,
  error: null,
};

const moodSlice = createSlice({
  name: 'mood',
  initialState,
  reducers: {
    setCurrentMood: (state, action: PayloadAction<MoodType>) => {
      state.currentMood = action.payload;
    },
    setIntensity: (
      state,
      action: PayloadAction<'low' | 'medium' | 'high'>
    ) => {
      state.intensity = action.payload;
    },
    setAvailableTime: (state, action: PayloadAction<number>) => {
      state.availableTime = action.payload;
    },
    setMoodResult: (state, action: PayloadAction<MoodResult>) => {
      state.result = action.payload;
    },
    clearMoodResult: (state) => {
      state.result = null;
      state.currentMood = null;
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
  setCurrentMood,
  setIntensity,
  setAvailableTime,
  setMoodResult,
  clearMoodResult,
  setLoading,
  setError,
} = moodSlice.actions;

export const moodReducer = moodSlice.reducer;
export default moodReducer;