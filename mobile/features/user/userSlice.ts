/**
 * User Slice - Phase 1: Minimal user state
 * 
 * For Phase 1, no authentication is required.
 * This slice maintains basic user preferences.
 * Auth features are commented out for Phase 2+.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  // Phase 1: Basic state only
  isFirstVisit: boolean;
  // Future Phase 2+ features
  // currentUser: User | null;
  // isAuthenticated: boolean;
  // activeHobbyId: string | null;
  // progress: Record<string, UserProgress>;
}

const initialState: UserState = {
  isFirstVisit: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFirstVisit: (state, action: PayloadAction<boolean>) => {
      state.isFirstVisit = action.payload;
    },
    // Phase 2+ reducers commented out
    // setCurrentUser: (state, action: PayloadAction<User | null>) => { ... }
    // setActiveHobbyId: (state, action: PayloadAction<string | null>) => { ... }
    // updateProgress: (state, action: PayloadAction<{ hobbyId: string; progress: UserProgress }>) => { ... }
  },
});

export const { setFirstVisit } = userSlice.actions;
export default userSlice.reducer;
