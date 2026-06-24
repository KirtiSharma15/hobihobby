/**
 * Root Navigator - Phase 2: Learning Paths MVP
 * 
 * No authentication required for Phase 2.
 * Main screen handles navigation to hobby details, learning paths, and lessons.
 * 
 * Feature flags control which screens are available:
 * - AUTH_REQUIRED: false (Phase 2)
 * - ONBOARDING_QUIZ: false (Phase 2)
 * - LEARNING_PATHS: true (Phase 2)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import MainTabNavigator from './MainTabNavigator';

// Feature flags for Phase 2
const FEATURES = {
  AUTH_REQUIRED: false,
  ONBOARDING_QUIZ: false,
  LEARNING_PATHS: true,  // Enabled in Phase 2
};

export type RootStackParamList = {
  Main: undefined;
  // Phase 3+ screens (commented out for Phase 2)
  // Onboarding: undefined;
  // Quiz: undefined;
  // Login: undefined;
  // Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  // Phase 2: Main screen handles all navigation including learning paths
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Phase 2: Main screen with discovery and learning paths */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
        
        {/* 
          Phase 3+ screens will be added here when feature flags are enabled:
          - Auth screens (Login, Register)
          - Onboarding screens
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
