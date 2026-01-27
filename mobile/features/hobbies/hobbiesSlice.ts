/**
 * Hobbies Slice - Phase 1: Discovery-First MVP
 * 
 * For Phase 1, save/unsave hobbies works locally (persisted via redux-persist).
 * No API calls for user-specific features until Phase 2+.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Hobby } from '../../types';
import { apiClient } from '../../api/client';

interface HobbiesState {
  hobbies: Hobby[];
  savedHobbyIds: string[]; // Phase 1: Local storage only
  currentHobby: Hobby | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    difficulty: string;
    searchQuery: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: HobbiesState = {
  hobbies: [],
  savedHobbyIds: [],
  currentHobby: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    difficulty: '',
    searchQuery: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks - Phase 1: Only public API calls
export const fetchHobbies = createAsyncThunk(
  'hobbies/fetchHobbies',
  async (params?: { page?: number; limit?: number; category?: string; difficulty?: string; search?: string }) => {
    const response = await apiClient.get('/hobbies', { params });
    return response.data;
  }
);

export const fetchHobbyById = createAsyncThunk(
  'hobbies/fetchHobbyById',
  async (id: string) => {
    const response = await apiClient.get(`/hobbies/${id}`);
    return response.data.data;
  }
);

const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState,
  reducers: {
    setCurrentHobby: (state, action: PayloadAction<Hobby | null>) => {
      state.currentHobby = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<HobbiesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        difficulty: '',
        searchQuery: '',
      };
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Phase 1: Local save/unsave (no API calls)
    toggleSaveHobby: (state, action: PayloadAction<string>) => {
      const hobbyId = action.payload;
      const index = state.savedHobbyIds.indexOf(hobbyId);
      if (index === -1) {
        state.savedHobbyIds.push(hobbyId);
      } else {
        state.savedHobbyIds.splice(index, 1);
      }
    },
    saveHobbyLocal: (state, action: PayloadAction<string>) => {
      const hobbyId = action.payload;
      if (!state.savedHobbyIds.includes(hobbyId)) {
        state.savedHobbyIds.push(hobbyId);
      }
    },
    unsaveHobbyLocal: (state, action: PayloadAction<string>) => {
      const hobbyId = action.payload;
      const index = state.savedHobbyIds.indexOf(hobbyId);
      if (index !== -1) {
        state.savedHobbyIds.splice(index, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hobbies
      .addCase(fetchHobbies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHobbies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hobbies = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchHobbies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch hobbies';
      })
      // Fetch Hobby by ID
      .addCase(fetchHobbyById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHobbyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHobby = action.payload;
      })
      .addCase(fetchHobbyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch hobby';
      });
  },
});

export const {
  setCurrentHobby,
  setFilters,
  clearFilters,
  clearError,
  toggleSaveHobby,
  saveHobbyLocal,
  unsaveHobbyLocal,
} = hobbiesSlice.actions;

export default hobbiesSlice.reducer;
