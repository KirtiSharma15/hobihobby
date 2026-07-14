import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { userReducer } from './slices/userSlice';
import { hobbiesReducer } from './slices/hobbiesSlice';
import { aiReducer } from './slices/aiSlice';
import { journeyReducer } from './slices/journeySlice';
import { mapReducer } from './slices/mapSlice';
import { moodReducer } from './slices/moodSlice';

export { setUser, clearUser, setLoading, setError } from './slices/userSlice';
export {
  setCatalog,
  setCurrentHobby,
  setCatalogLoading,
  setCatalogError,
  setSavedHobbies,
  addSavedHobby,
  removeSavedHobby,
} from './slices/hobbiesSlice';
export type { Hobby } from './slices/hobbiesSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    hobbies: hobbiesReducer,
    ai: aiReducer,
    journey: journeyReducer,
    map: mapReducer,
    mood: moodReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
