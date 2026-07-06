/**
 * User Slice - Phase 1: Minimal user state
 * 
 * For Phase 1, no authentication is required.
 * This slice maintains basic user preferences.
 * Auth and learning path features are commented out for Phase 2+.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  // Phase 1: Basic state only
  isFirstVisit: boolean;
  theme: 'light' | 'dark';
  
  // Phase 2+ features (commented out for now)
  // currentUser: User | null;
  // isAuthenticated: boolean;
  // isLoading: boolean;
  // error: string | null;
  // activeHobbyId: string | null;
  // progress: Record<string, UserProgress>;
}

const initialState: UserState = {
  isFirstVisit: true,
  theme: 'light',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFirstVisit: (state, action: PayloadAction<boolean>) => {
      state.isFirstVisit = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Phase 2+ reducers commented out
    // setUser: (state, action: PayloadAction<User>) => { ... }
    // logout: (state) => { ... }
    // setActiveHobby: (state, action: PayloadAction<string | null>) => { ... }
    // updateProgress: (state, action: PayloadAction<UserProgress>) => { ... }
  },
});

export const { setFirstVisit, setTheme, toggleTheme } = userSlice.actions;
export default userSlice.reducer;
