import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  theme: 'light' | 'dark';
  isOnboardingComplete: boolean;
  activeTab: string;
}

const initialState: UIState = {
  isLoading: false,
  error: null,
  success: null,
  theme: 'light',
  isOnboardingComplete: false,
  activeTab: 'Home',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSuccess: (state, action: PayloadAction<string | null>) => {
      state.success = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccess,
  clearMessages,
  toggleTheme,
  setTheme,
  setOnboardingComplete,
  setActiveTab,
} = uiSlice.actions;

export default uiSlice.reducer;




