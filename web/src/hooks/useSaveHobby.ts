import { useState, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { addSavedHobby, removeSavedHobby, type RootState } from '../store';
import api from '../services/api';

export interface UseSaveHobbyReturn {
  isSaved: boolean;
  toggleSave: () => Promise<void>;
  isLoading: boolean;
}

export const useSaveHobby = (hobbyId: string): UseSaveHobbyReturn => {
  const dispatch = useAppDispatch();
  const savedHobbyIds = useAppSelector(
    (state: RootState) => state.savedHobbies.savedHobbyIds
  );
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const isSaved = useMemo(
    () => savedHobbyIds.includes(hobbyId),
    [savedHobbyIds, hobbyId]
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleSave = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/hobbies/${hobbyId}/save`);
        dispatch(removeSavedHobby(hobbyId));
      } else {
        await api.post(`/hobbies/${hobbyId}/save`);
        dispatch(addSavedHobby(hobbyId));
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, hobbyId, isAuthenticated, isSaved]);

  return { isSaved, toggleSave, isLoading };
};
