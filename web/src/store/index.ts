/**
 * Web Store - Phase 1: Discovery-First MVP
 * 
 * Simplified store for Phase 1 (no authentication).
 * Auth slice commented out for Phase 2+.
 */

import { configureStore, createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

// Types
export interface Hobby {
  id: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  timeRequired?: string;
  cost?: string;
}

// Hobbies Slice - Phase 1: Discovery only
interface HobbiesState {
  hobbies: Hobby[];
  selectedHobby: Hobby | null;
  savedHobbyIds: string[]; // Phase 1: Local storage
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    difficulty: string | null;
    search: string;
  };
}

const initialHobbiesState: HobbiesState = {
  hobbies: [],
  selectedHobby: null,
  savedHobbyIds: JSON.parse(localStorage.getItem('savedHobbyIds') || '[]'),
  isLoading: false,
  error: null,
  filters: {
    category: null,
    difficulty: null,
    search: '',
  },
};

// Async thunk for fetching hobbies
export const fetchHobbies = createAsyncThunk(
  'hobbies/fetchHobbies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/hobbies');
      return response.data.data || response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch hobbies');
    }
  }
);

const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState: initialHobbiesState,
  reducers: {
    setHobbies: (state, action: PayloadAction<Hobby[]>) => {
      state.hobbies = action.payload;
    },
    setSelectedHobby: (state, action: PayloadAction<Hobby | null>) => {
      state.selectedHobby = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<HobbiesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: null, difficulty: null, search: '' };
    },
    // Phase 1: Local save/unsave (persisted to localStorage)
    toggleSaveHobby: (state, action: PayloadAction<string>) => {
      const hobbyId = action.payload;
      const index = state.savedHobbyIds.indexOf(hobbyId);
      if (index === -1) {
        state.savedHobbyIds.push(hobbyId);
      } else {
        state.savedHobbyIds.splice(index, 1);
      }
      localStorage.setItem('savedHobbyIds', JSON.stringify(state.savedHobbyIds));
    },
    saveHobby: (state, action: PayloadAction<string>) => {
      const hobbyId = action.payload;
      if (!state.savedHobbyIds.includes(hobbyId)) {
        state.savedHobbyIds.push(hobbyId);
        localStorage.setItem('savedHobbyIds', JSON.stringify(state.savedHobbyIds));
      }
    },
    unsaveHobby: (state, action: PayloadAction<string>) => {
      const hobbyId = action.payload;
      const index = state.savedHobbyIds.indexOf(hobbyId);
      if (index !== -1) {
        state.savedHobbyIds.splice(index, 1);
        localStorage.setItem('savedHobbyIds', JSON.stringify(state.savedHobbyIds));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHobbies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHobbies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hobbies = action.payload;
      })
      .addCase(fetchHobbies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// UI Slice
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

const initialUIState: UIState = {
  theme: 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

// Configure store (Phase 1: No auth slice)
export const store = configureStore({
  reducer: {
    hobbies: hobbiesSlice.reducer,
    ui: uiSlice.reducer,
  },
});

// Export actions
export const { 
  setHobbies, 
  setSelectedHobby, 
  setFilters, 
  clearFilters,
  toggleSaveHobby,
  saveHobby,
  unsaveHobby,
} = hobbiesSlice.actions;

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen } = uiSlice.actions;

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
