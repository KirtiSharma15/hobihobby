import { useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  getRedirectResult,
  type User as FirebaseUser,
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, googleProvider, app, db } from '../services/firebase';
import { useAppDispatch } from './useAppDispatch';
import {
  setUser,
  clearUser,
  setLoading,
  setError,
  setSavedHobbies,
  type AppDispatch,
} from '../store';
import type { UserProfile } from '../store/slices/userSlice';

interface SyncUserCallableRequest {
  displayName: string;
  photoURL: string;
}

interface SyncUserCallableResponse {
  isNewUser: boolean;
  data: UserProfile;
}

export interface UseAuthReturn {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

interface UseAuthOptions {
  /** When false, only exposes actions (no Firebase listener). Default true. */
  subscribe?: boolean;
}

const functions = getFunctions(app, 'us-central1');
const syncUserCallable = httpsCallable<SyncUserCallableRequest, SyncUserCallableResponse>(
  functions,
  'syncUser'
);

const fetchSavedHobbyIds = async (uid: string): Promise<string[]> => {
  const snap = await getDocs(collection(db, 'users', uid, 'savedHobbies'));
  return snap.docs.map((doc) => doc.id);
};

const syncSignedInUser = async (
  dispatch: AppDispatch,
  firebaseUser: FirebaseUser
): Promise<void> => {
  dispatch(setLoading(true));
  try {
    await firebaseUser.getIdToken();

    const { data: syncResult } = await syncUserCallable({
      displayName: firebaseUser.displayName ?? '',
      photoURL: firebaseUser.photoURL ?? '',
    });
    dispatch(setUser(syncResult.data));

    const savedIds = await fetchSavedHobbyIds(firebaseUser.uid);
    dispatch(setSavedHobbies(savedIds));
  } catch {
    dispatch(setError('Failed to load user profile'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const useAuth = (options: UseAuthOptions = {}): UseAuthReturn => {
  const { subscribe = true } = options;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!subscribe) return;

    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await syncSignedInUser(dispatch, result.user);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncSignedInUser(dispatch, firebaseUser);
      } else {
        dispatch(clearUser());
      }
    });

    return unsubscribe;
  }, [dispatch, subscribe]);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const code = (error as { code?: string }).code;
      if (code === 'auth/unauthorized-domain') {
        dispatch(
          setError(
            'Sign-in is not enabled for this domain. Add hobihobby.com to Firebase Auth authorized domains.'
          )
        );
      } else {
        dispatch(setError('Google sign-in failed'));
      }
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await signOut(auth);
    dispatch(clearUser());
  }, [dispatch]);

  return { loginWithGoogle, logout };
};
