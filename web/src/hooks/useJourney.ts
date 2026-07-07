import { useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { db, auth } from '../services/firebase';
import {
  setJourney,
  updateStreak,
  addCompletedDay,
  addMilestone,
  setCurrentTemplate,
  setWeeklyPlan,
  setLoading,
  setError,
  type Journey,
  type JourneyDay,
} from '../store/slices/journeySlice';

interface StartJourneyRequest {
  hobbyId: string;
}

interface StartJourneyResponse {
  isNewJourney?: boolean;
  alreadyStarted?: boolean;
  data: Journey;
}

interface CompleteDayRequest {
  hobbyId: string;
  day: number;
  photoURL?: string;
}

interface CompleteDayResponse {
  alreadyCompleted?: boolean;
  streak?: number;
  milestones?: string[];
  newMilestones?: string[];
  nextDay?: number;
}

interface WeeklyPlanRequest {
  hobbyId: string;
  currentDay: number;
}

export interface WeeklyPlanDailyTip {
  day: number;
  tip: string;
}

export interface WeeklyPlan {
  weekTheme: string;
  encouragement: string;
  dailyTips: WeeklyPlanDailyTip[];
  weeklyGoal: string;
}

export interface UseJourneyReturn {
  activeJourneys: Record<string, Journey>;
  currentTemplate: JourneyDay[] | null;
  isLoading: boolean;
  error: string | null;
  startJourney: (hobbyId: string) => Promise<{ isNewJourney: boolean; data: Journey }>;
  completeDay: (
    hobbyId: string,
    day: number,
    photoURL?: string
  ) => Promise<{ streak: number; newMilestones: string[]; nextDay: number }>;
  getWeeklyPlan: (hobbyId: string, currentDay: number) => Promise<WeeklyPlan>;
  loadUserJourneys: () => Promise<void>;
  loadJourneyTemplate: (hobbyId: string) => Promise<void>;
}

/** Reads all journey docs for a user directly from Firestore (no Cloud Function round-trip needed for a plain read). */
export const fetchUserJourneys = async (uid: string): Promise<Journey[]> => {
  const snap = await getDocs(collection(db, 'users', uid, 'journeys'));
  return snap.docs.map((docSnap) => docSnap.data() as Journey);
};

export const useJourney = (): UseJourneyReturn => {
  const dispatch = useAppDispatch();
  const activeJourneys = useAppSelector((state) => state.journey.activeJourneys);
  const currentTemplate = useAppSelector((state) => state.journey.currentTemplate);
  const isLoading = useAppSelector((state) => state.journey.isLoading);
  const error = useAppSelector((state) => state.journey.error);

  const startJourney = useCallback(
    async (hobbyId: string) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const functions = getFunctions();
        const startJourneyFn = httpsCallable<StartJourneyRequest, StartJourneyResponse>(
          functions,
          'startJourney'
        );
        const result = await startJourneyFn({ hobbyId });
        dispatch(setJourney(result.data.data));
        return { isNewJourney: Boolean(result.data.isNewJourney), data: result.data.data };
      } catch (err) {
        dispatch(setError('Failed to start journey. Please try again.'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const completeDay = useCallback(
    async (hobbyId: string, day: number, photoURL?: string) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const functions = getFunctions();
        const completeDayFn = httpsCallable<CompleteDayRequest, CompleteDayResponse>(
          functions,
          'completeDay'
        );
        const result = await completeDayFn({ hobbyId, day, photoURL });
        const { alreadyCompleted, streak, newMilestones, nextDay } = result.data;

        if (alreadyCompleted || typeof streak !== 'number' || typeof nextDay !== 'number') {
          const existing = activeJourneys[hobbyId];
          return {
            streak: existing?.streak ?? 0,
            newMilestones: [],
            nextDay: existing?.currentDay ?? day + 1,
          };
        }

        dispatch(addCompletedDay({ hobbyId, day }));
        dispatch(updateStreak({ hobbyId, streak }));
        newMilestones?.forEach((milestone) => {
          dispatch(addMilestone({ hobbyId, milestone }));
        });

        return { streak, newMilestones: newMilestones ?? [], nextDay };
      } catch (err) {
        dispatch(setError('Failed to save progress. Please try again.'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, activeJourneys]
  );

  const getWeeklyPlan = useCallback(
    async (hobbyId: string, currentDay: number) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const functions = getFunctions();
        const getWeeklyPlanFn = httpsCallable<WeeklyPlanRequest, WeeklyPlan>(
          functions,
          'getWeeklyPlan'
        );
        const result = await getWeeklyPlanFn({ hobbyId, currentDay });
        dispatch(setWeeklyPlan(result.data));
        return result.data;
      } catch (err) {
        dispatch(setError('Failed to generate weekly plan. Please try again.'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const loadJourneyTemplate = useCallback(
    async (hobbyId: string) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const snap = await getDoc(doc(db, 'journeyTemplates', hobbyId));
        if (!snap.exists()) {
          dispatch(setError('Journey template not found'));
          return;
        }
        const template = snap.data();
        dispatch(setCurrentTemplate((template.days ?? []) as JourneyDay[]));
      } catch (err) {
        dispatch(setError('Failed to load journey plan.'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const loadUserJourneys = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const journeys = await fetchUserJourneys(user.uid);
      journeys.forEach((journey) => dispatch(setJourney(journey)));
    } catch (err) {
      dispatch(setError('Failed to load your journeys.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    activeJourneys,
    currentTemplate,
    isLoading,
    error,
    startJourney,
    completeDay,
    getWeeklyPlan,
    loadUserJourneys,
    loadJourneyTemplate,
  };
};
