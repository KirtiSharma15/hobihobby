import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from '../features/user/userSlice';
import hobbiesReducer from '../features/hobbies/hobbiesSlice';
import uiReducer from '../features/ui/uiSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'hobbies'], // Only persist user and hobbies data
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedHobbiesReducer = persistReducer(persistConfig, hobbiesReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    hobbies: persistedHobbiesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;