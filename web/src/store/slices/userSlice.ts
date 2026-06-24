import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
  indoorOutdoor?: string | null;
  soloGroup?: string | null;
  budgetRange?: string | null;
  availableTime?: string | null;
  [key: string]: string | null | undefined;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
}

export interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: () => initialState,
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;
export const userReducer = userSlice.reducer;
export default userReducer;
