import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import userReducer from './userSlice';
import hobbiesReducer from './hobbiesSlice';
import uiReducer from './uiSlice';

// This will be provided by each platform
let storage: any;

export const setStorageEngine = (storageEngine: any) => {
  storage = storageEngine;
};

export const createAppStore = (persistStorage: any) => {
  const persistConfig: PersistConfig<any> = {
    key: 'root',
    storage: persistStorage,
    whitelist: ['user', 'hobbies'], // Only persist user and hobbies data
  };

  const persistedUserReducer = persistReducer(persistConfig, userReducer);
  const persistedHobbiesReducer = persistReducer(persistConfig, hobbiesReducer);

  const store = configureStore({
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

  const persistor = persistStore(store);

  return { store, persistor };
};

export type RootState = ReturnType<ReturnType<typeof createAppStore>['store']['getState']>;
export type AppDispatch = ReturnType<typeof createAppStore>['store']['dispatch'];