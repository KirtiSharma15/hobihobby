/**
 * useLocalSavedHobbies Hook
 * 
 * Manages locally saved hobbies using AsyncStorage.
 * No authentication required - works offline.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hobihobby_saved_hobbies';

interface LocalSavedHobbies {
  savedIds: string[];
  savedAt: Record<string, string>;
}

export function useLocalSavedHobbies() {
  const [savedHobbies, setSavedHobbies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved hobbies on mount
  useEffect(() => {
    loadSavedHobbies();
  }, []);

  const loadSavedHobbies = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: LocalSavedHobbies = JSON.parse(data);
        setSavedHobbies(new Set(parsed.savedIds || []));
      }
    } catch (error) {
      console.error('Error loading saved hobbies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHobby = useCallback(async (hobbyId: string) => {
    try {
      const currentData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: LocalSavedHobbies = currentData 
        ? JSON.parse(currentData) 
        : { savedIds: [], savedAt: {} };
      
      if (!parsed.savedIds.includes(hobbyId)) {
        parsed.savedIds.push(hobbyId);
        parsed.savedAt[hobbyId] = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        setSavedHobbies(new Set(parsed.savedIds));
      }
    } catch (error) {
      console.error('Error saving hobby:', error);
    }
  }, []);

  const unsaveHobby = useCallback(async (hobbyId: string) => {
    try {
      const currentData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!currentData) return;
      
      const parsed: LocalSavedHobbies = JSON.parse(currentData);
      parsed.savedIds = parsed.savedIds.filter(id => id !== hobbyId);
      delete parsed.savedAt[hobbyId];
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setSavedHobbies(new Set(parsed.savedIds));
    } catch (error) {
      console.error('Error unsaving hobby:', error);
    }
  }, []);

  const toggleSaveHobby = useCallback(async (hobbyId: string) => {
    if (savedHobbies.has(hobbyId)) {
      await unsaveHobby(hobbyId);
      return false;
    } else {
      await saveHobby(hobbyId);
      return true;
    }
  }, [savedHobbies, saveHobby, unsaveHobby]);

  const isHobbySaved = useCallback((hobbyId: string) => {
    return savedHobbies.has(hobbyId);
  }, [savedHobbies]);

  const getSavedCount = useCallback(() => {
    return savedHobbies.size;
  }, [savedHobbies]);

  const getSavedIds = useCallback(() => {
    return Array.from(savedHobbies);
  }, [savedHobbies]);

  return {
    savedHobbies,
    isLoading,
    saveHobby,
    unsaveHobby,
    toggleSaveHobby,
    isHobbySaved,
    getSavedCount,
    getSavedIds,
    refreshSavedHobbies: loadSavedHobbies,
  };
}

export default useLocalSavedHobbies;


