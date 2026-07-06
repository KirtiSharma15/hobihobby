// Types
export * from './types';

// Feature Flags
export * from './config/featureFlags';

// API
export * from './api/client';

// Store
export * from './store';
export { default as userReducer } from './store/userSlice';
export { default as hobbiesReducer } from './store/hobbiesSlice';
export { default as uiReducer } from './store/uiSlice';

// Export the actions directly
export { 
  loginUser, 
  registerUser, 
  logout, 
  setUser, 
  clearError, 
  updateTheme,
  fetchUserProfile,
} from './store/userSlice';

export { 
  fetchHobbies, 
  fetchHobbyById, 
  saveHobby, 
  unsaveHobby,
  setCurrentHobby, 
  setFilters, 
  clearFilters 
} from './store/hobbiesSlice';

// Utils
export * from './utils';