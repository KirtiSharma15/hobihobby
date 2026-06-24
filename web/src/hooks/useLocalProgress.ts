/**
 * useLocalProgress Hook (Web)
 * 
 * Manages learning progress using localStorage.
 * Tracks completed lessons per hobby.
 * No authentication required - works offline.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hobihobby_learning_progress';

export interface HobbyProgress {
  hobbyId: string;
  completedLessons: string[];
  currentModuleId: string | null;
  currentLessonId: string | null;
  startedAt: string;
  lastActivityAt: string;
}

interface AllProgress {
  [hobbyId: string]: HobbyProgress;
}

export function useLocalProgress(hobbyId: string) {
  const [progress, setProgress] = useState<HobbyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress on mount or when hobbyId changes
  useEffect(() => {
    loadProgress();
  }, [hobbyId]);

  const loadProgress = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const allProgress: AllProgress = JSON.parse(data);
        setProgress(allProgress[hobbyId] || null);
      } else {
        setProgress(null);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  }, [hobbyId]);

  const saveProgress = useCallback((newProgress: HobbyProgress) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allProgress: AllProgress = data ? JSON.parse(data) : {};
      allProgress[hobbyId] = newProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [hobbyId]);

  const markLessonComplete = useCallback((lessonId: string) => {
    const now = new Date().toISOString();
    
    const currentProgress = progress || {
      hobbyId,
      completedLessons: [],
      currentModuleId: null,
      currentLessonId: null,
      startedAt: now,
      lastActivityAt: now,
    };

    // Don't add duplicate
    if (currentProgress.completedLessons.includes(lessonId)) {
      return;
    }

    const updatedProgress: HobbyProgress = {
      ...currentProgress,
      completedLessons: [...currentProgress.completedLessons, lessonId],
      currentLessonId: lessonId,
      lastActivityAt: now,
    };

    saveProgress(updatedProgress);
  }, [hobbyId, progress, saveProgress]);

  const markLessonIncomplete = useCallback((lessonId: string) => {
    if (!progress) return;

    const updatedProgress: HobbyProgress = {
      ...progress,
      completedLessons: progress.completedLessons.filter(id => id !== lessonId),
      lastActivityAt: new Date().toISOString(),
    };

    saveProgress(updatedProgress);
  }, [progress, saveProgress]);

  const isLessonCompleted = useCallback((lessonId: string): boolean => {
    return progress?.completedLessons.includes(lessonId) || false;
  }, [progress]);

  const getCompletedLessons = useCallback((): string[] => {
    return progress?.completedLessons || [];
  }, [progress]);

  const getProgressPercent = useCallback((totalLessons: number): number => {
    if (!progress || totalLessons === 0) return 0;
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  }, [progress]);

  const resetProgress = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const allProgress: AllProgress = JSON.parse(data);
        delete allProgress[hobbyId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
      }
      setProgress(null);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [hobbyId]);

  const setCurrentPosition = useCallback((moduleId: string, lessonId: string) => {
    const now = new Date().toISOString();
    
    const currentProgress = progress || {
      hobbyId,
      completedLessons: [],
      currentModuleId: null,
      currentLessonId: null,
      startedAt: now,
      lastActivityAt: now,
    };

    const updatedProgress: HobbyProgress = {
      ...currentProgress,
      currentModuleId: moduleId,
      currentLessonId: lessonId,
      lastActivityAt: now,
    };

    saveProgress(updatedProgress);
  }, [hobbyId, progress, saveProgress]);

  return {
    progress,
    isLoading,
    markLessonComplete,
    markLessonIncomplete,
    isLessonCompleted,
    getCompletedLessons,
    getProgressPercent,
    resetProgress,
    setCurrentPosition,
    refreshProgress: loadProgress,
  };
}

/**
 * Get progress for all hobbies
 */
export function getAllProgress(): AllProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting all progress:', error);
    return {};
  }
}

export default useLocalProgress;
