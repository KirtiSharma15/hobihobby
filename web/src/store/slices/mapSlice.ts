import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Place {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  phone: string;
  website: string;
  priceLevel: number;
  types: string[];
  photoReference: string;
  distance: number;
}

export type PlaceFilter = 'all' | 'classes' | 'stores' | 'events';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MapState {
  places: Place[];
  selectedPlace: Place | null;
  userLocation: UserLocation | null;
  activeFilter: PlaceFilter;
  isLoading: boolean;
  error: string | null;
}

const initialState: MapState = {
  places: [],
  selectedPlace: null,
  userLocation: null,
  activeFilter: 'all',
  isLoading: false,
  error: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setPlaces: (state, action: PayloadAction<Place[]>) => {
      state.places = action.payload;
    },
    setSelectedPlace: (state, action: PayloadAction<Place | null>) => {
      state.selectedPlace = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<UserLocation>) => {
      state.userLocation = action.payload;
    },
    setActiveFilter: (state, action: PayloadAction<PlaceFilter>) => {
      state.activeFilter = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPlaces,
  setSelectedPlace,
  setUserLocation,
  setActiveFilter,
  setLoading,
  setError,
} = mapSlice.actions;

export const mapReducer = mapSlice.reducer;
export default mapReducer;