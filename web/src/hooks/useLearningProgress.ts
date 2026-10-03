import { useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  setLearningProgress,
  setLoading,
  setError,
  type LearningProgress,
} from '../store/slices/journeySlice';

interface UpdateLearningProgressRequest {
  hobbyId: string;
  lessonId: string;
  completed: boolean;
}

interface UpdateLearningProgressResponse {
  success: boolean;
  learningProgress: LearningProgress;
}

interface GetLearningProgressRequest {
  hobbyId: string;
}

interface GetLearningProgressResponse {
  learningProgress: LearningProgress | null;
}

export interface UseLearningProgressReturn {
  isLoading: boolean;
  error: string | null;
  markLessonProgress: (
    hobbyId: string,
    lessonId: string,
    completed: boolean
  ) => Promise<UpdateLearningProgressResponse>;
  loadLearningProgress: (hobbyId: string) => Promise<LearningProgress | null>;
  getProgressForHobby: (hobbyId: string) => LearningProgress | undefined;
}

export const useLearningProgress = (): UseLearningProgressReturn => {
  const dispatch = useAppDispatch();
  const activeJourneys = useAppSelector((state) => state.journey.activeJourneys);
  const isLoading = useAppSelector((state) => state.journey.isLoading);
  const error = useAppSelector((state) => state.journey.error);

  const markLessonProgress = useCallback(
    async (hobbyId: string, lessonId: string, completed: boolean) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const functions = getFunctions();
        const updateFn = httpsCallable<
          UpdateLearningProgressRequest,
          UpdateLearningProgressResponse
        >(functions, 'updateLearningProgress');
        const result = await updateFn({ hobbyId, lessonId, completed });
        dispatch(
          setLearningProgress({
            hobbyId,
            progress: result.data.learningProgress,
          })
        );
        return result.data;
      } catch (err) {
        dispatch(setError('Failed to save learning progress. Please try again.'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const loadLearningProgress = useCallback(
    async (hobbyId: string) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const functions = getFunctions();
        const getFn = httpsCallable<
          GetLearningProgressRequest,
          GetLearningProgressResponse
        >(functions, 'getLearningProgress');
        const result = await getFn({ hobbyId });
        const progress = result.data.learningProgress;
        if (progress !== null) {
          dispatch(setLearningProgress({ hobbyId, progress }));
        }
        return progress;
      } catch (err) {
        dispatch(setError('Failed to load learning progress. Please try again.'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const getProgressForHobby = useCallback(
    (hobbyId: string): LearningProgress | undefined =>
      activeJourneys[hobbyId]?.learningProgress,
    [activeJourneys]
  );

  return {
    isLoading,
    error,
    markLessonProgress,
    loadLearningProgress,
    getProgressForHobby,
  };
};
