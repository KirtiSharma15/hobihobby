import { useState, useCallback, useMemo } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { addSavedHobby, removeSavedHobby, type RootState } from '../store';
import { auth, db } from '../services/firebase';

export interface UseSaveHobbyReturn {
  isSaved: boolean;
  toggleSave: () => Promise<void>;
  isLoading: boolean;
}

export const useSaveHobby = (hobbyId: string): UseSaveHobbyReturn => {
  const dispatch = useAppDispatch();
  const savedHobbyIds = useAppSelector(
    (state: RootState) => state.hobbies.savedHobbyIds
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
    const user = auth.currentUser;
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    try {
      const savedRef = doc(db, 'users', user.uid, 'savedHobbies', hobbyId);
      if (isSaved) {
        await deleteDoc(savedRef);
        dispatch(removeSavedHobby(hobbyId));
      } else {
        await setDoc(savedRef, { savedAt: new Date().toISOString() });
        dispatch(addSavedHobby(hobbyId));
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, hobbyId, isAuthenticated, isSaved]);

  return { isSaved, toggleSave, isLoading };
};
