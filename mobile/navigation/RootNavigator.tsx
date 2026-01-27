/**
 * Root Navigator - Phase 1: Discovery-First MVP
 * 
 * No authentication required for Phase 1.
 * Goes directly to Main screen for hobby discovery.
 * 
 * Feature flags control which screens are available:
 * - AUTH_REQUIRED: false (Phase 1)
 * - ONBOARDING_QUIZ: false (Phase 1)
 * - LEARNING_PATHS: false (Phase 1)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import MainTabNavigator from './MainTabNavigator';

// Feature flags for Phase 1
const FEATURES = {
  AUTH_REQUIRED: false,
  ONBOARDING_QUIZ: false,
  LEARNING_PATHS: false,
};

export type RootStackParamList = {
  Main: undefined;
  // Future Phase 2+ screens (commented out for Phase 1)
  // Onboarding: undefined;
  // Quiz: undefined;
  // Login: undefined;
  // Register: undefined;
  // LearningPath: { hobbyId: string; hobbyTitle: string };
  // Lesson: { hobbyId: string; moduleId: string; lessonId: string; lessonTitle: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  // Phase 1: Go directly to Main screen (no auth required)
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Phase 1: Only Main screen for discovery */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
        
        {/* 
          Phase 2+ screens will be added here when feature flags are enabled:
          - Auth screens (Login, Register)
          - Onboarding screens
          - Learning path screens
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
