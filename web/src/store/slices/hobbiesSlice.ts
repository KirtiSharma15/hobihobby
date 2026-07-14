import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Hobby {
  id: string;
  name: string;
  tagline: string;
  category: string;
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timePerWeek: string;
  timeMinutes: number;
  estimatedCostAED: number;
  costRange: 'low' | 'medium' | 'high';
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  soloGroup: 'solo' | 'social' | 'both';
  emoji: string;
  tags: string[];
  description: string;
  starterKit: string[];
  popularIn: string[];
  hasLearningPath: boolean;
  hasJourneyTemplate: boolean;
  imageUrl: string;
  matchTags: string[];
}

export interface HobbiesState {
  catalog: Hobby[];
  currentHobby: Hobby | null;
  catalogLoading: boolean;
  catalogError: string | null;
  savedHobbyIds: string[];
  isLoading: boolean;
}

const initialState: HobbiesState = {
  catalog: [],
  currentHobby: null,
  catalogLoading: false,
  catalogError: null,
  savedHobbyIds: [],
  isLoading: false,
};

const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState,
  reducers: {
    setCatalog: (state, action: PayloadAction<Hobby[]>) => {
      state.catalog = action.payload;
    },
    setCurrentHobby: (state, action: PayloadAction<Hobby | null>) => {
      state.currentHobby = action.payload;
    },
    setCatalogLoading: (state, action: PayloadAction<boolean>) => {
      state.catalogLoading = action.payload;
    },
    setCatalogError: (state, action: PayloadAction<string | null>) => {
      state.catalogError = action.payload;
    },
    setSavedHobbies: (state, action: PayloadAction<string[]>) => {
      state.savedHobbyIds = action.payload;
    },
    addSavedHobby: (state, action: PayloadAction<string>) => {
      if (!state.savedHobbyIds.includes(action.payload)) {
        state.savedHobbyIds.push(action.payload);
      }
    },
    removeSavedHobby: (state, action: PayloadAction<string>) => {
      state.savedHobbyIds = state.savedHobbyIds.filter((id) => id !== action.payload);
    },
  },
});

export const {
  setCatalog,
  setCurrentHobby,
  setCatalogLoading,
  setCatalogError,
  setSavedHobbies,
  addSavedHobby,
  removeSavedHobby,
} = hobbiesSlice.actions;

export const hobbiesReducer = hobbiesSlice.reducer;
export default hobbiesReducer;
