import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  setCurrentMood,
  setIntensity,
  setAvailableTime,
  setMoodResult,
  clearMoodResult,
  setLoading,
  setError,
  type MoodType,
  type MoodResult,
  type MoodRecommendation,
} from '../store/slices/moodSlice';

interface MoodRecommendationsRequest {
  mood: string;
  intensity?: 'low' | 'medium' | 'high';
  availableTime?: number;
  savedHobbies?: string[];
  activeJourneys?: Array<{ hobbyName: string; currentDay: number }>;
}

interface MoodRecommendationsResponse {
  moodInsight: string;
  recommendations: MoodRecommendation[];
}

export interface UseMoodReturn {
  currentMood: MoodType | null;
  intensity: 'low' | 'medium' | 'high';
  availableTime: number;
  result: MoodResult | null;
  isLoading: boolean;
  error: string | null;
  selectMood: (mood: MoodType) => void;
  selectIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  selectTime: (minutes: number) => void;
  getRecommendations: () => Promise<MoodResult>;
  clearMood: () => void;
}

export const useMood = (): UseMoodReturn => {
  const dispatch = useAppDispatch();
  const currentMood = useAppSelector((state) => state.mood.currentMood);
  const intensity = useAppSelector((state) => state.mood.intensity);
  const availableTime = useAppSelector((state) => state.mood.availableTime);
  const result = useAppSelector((state) => state.mood.result);
  const isLoading = useAppSelector((state) => state.mood.isLoading);
  const error = useAppSelector((state) => state.mood.error);
  const savedHobbyIds = useAppSelector((state) => state.hobbies.savedHobbyIds);
  const activeJourneys = useAppSelector((state) => state.journey.activeJourneys);

  const selectMood = (mood: MoodType): void => {
    dispatch(clearMoodResult());
    dispatch(setCurrentMood(mood));
  };

  const selectIntensity = (value: 'low' | 'medium' | 'high'): void => {
    dispatch(setIntensity(value));
  };

  const selectTime = (minutes: number): void => {
    dispatch(setAvailableTime(minutes));
  };

  const getRecommendations = async (): Promise<MoodResult> => {
    if (!currentMood) {
      const message = 'Select a mood before getting recommendations.';
      dispatch(setError(message));
      throw new Error(message);
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const functions = getFunctions();
      const getMoodRecommendationsFn = httpsCallable<
        MoodRecommendationsRequest,
        MoodRecommendationsResponse
      >(functions, 'getMoodRecommendations');

      const response = await getMoodRecommendationsFn({
        mood: currentMood,
        intensity,
        availableTime,
        savedHobbies: savedHobbyIds,
        activeJourneys: Object.values(activeJourneys).map((j) => ({
          hobbyName: j.hobbyName,
          currentDay: j.currentDay,
        })),
      });

      const moodResult: MoodResult = {
        mood: currentMood,
        moodInsight: response.data.moodInsight,
        recommendations: response.data.recommendations,
        generatedAt: new Date().toISOString(),
      };

      dispatch(setMoodResult(moodResult));
      return moodResult;
    } catch (err) {
      dispatch(setError('Failed to get mood recommendations. Please try again.'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const clearMood = (): void => {
    dispatch(clearMoodResult());
  };

  return {
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
  };
};
