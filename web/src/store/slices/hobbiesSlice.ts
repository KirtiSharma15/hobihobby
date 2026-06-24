import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HobbiesState {
  savedHobbyIds: string[];
  isLoading: boolean;
}

const initialState: HobbiesState = {
  savedHobbyIds: [],
  isLoading: false,
};

const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState,
  reducers: {
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

export const { setSavedHobbies, addSavedHobby, removeSavedHobby } = hobbiesSlice.actions;
export const hobbiesReducer = hobbiesSlice.reducer;
export default hobbiesReducer;
