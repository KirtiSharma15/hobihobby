/**
 * Main Tab Navigator - Phase 2: Learning Paths MVP
 * 
 * No authentication required. Tab navigation with
 * learning path and lesson screens integrated.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ResponsiveLayout from '../components/ResponsiveLayout';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import HobbyDetailScreen from '../screens/HobbyDetailScreen';
import LearningPathScreen from '../screens/LearningPathScreen';
import LessonScreen from '../screens/LessonScreen';
import { RootStackParamList } from './RootNavigator';

type MainNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

// Navigation state types
type NavigationScreen = 
  | { type: 'tabs' }
  | { type: 'hobbyDetail'; hobbyId: string }
  | { type: 'learningPath'; hobbyId: string }
  | { type: 'lesson'; hobbyId: string; moduleId: string; lessonId: string };

const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'profile'>('home');
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>({ type: 'tabs' });
  const navigation = useNavigation<MainNavigationProp>();

  // Navigation handlers
  const handleHobbyClick = (hobbyId: string) => {
    setCurrentScreen({ type: 'hobbyDetail', hobbyId });
  };

  const handleBackFromDetail = () => {
    setCurrentScreen({ type: 'tabs' });
  };

  const handleStartLearning = (hobbyId: string) => {
    setCurrentScreen({ type: 'learningPath', hobbyId });
  };

  const handleBackFromLearning = () => {
    if (currentScreen.type === 'learningPath') {
      setCurrentScreen({ type: 'hobbyDetail', hobbyId: currentScreen.hobbyId });
    } else {
      setCurrentScreen({ type: 'tabs' });
    }
  };

  const handleNavigateToLesson = (moduleId: string, lessonId: string) => {
    if (currentScreen.type === 'learningPath' || currentScreen.type === 'lesson') {
      const hobbyId = currentScreen.hobbyId;
      setCurrentScreen({ type: 'lesson', hobbyId, moduleId, lessonId });
    }
  };

  const handleBackToCourse = () => {
    if (currentScreen.type === 'lesson') {
      setCurrentScreen({ type: 'learningPath', hobbyId: currentScreen.hobbyId });
    }
  };

  // Render based on current screen
  if (currentScreen.type === 'lesson') {
    return (
      <LessonScreen
        hobbyId={currentScreen.hobbyId}
        moduleId={currentScreen.moduleId}
        lessonId={currentScreen.lessonId}
        onBack={handleBackToCourse}
        onNavigateToLesson={handleNavigateToLesson}
        onBackToCourse={handleBackToCourse}
      />
    );
  }

  if (currentScreen.type === 'learningPath') {
    return (
      <LearningPathScreen
        hobbyId={currentScreen.hobbyId}
        onBack={handleBackFromLearning}
        onNavigateToLesson={handleNavigateToLesson}
      />
    );
  }

  if (currentScreen.type === 'hobbyDetail') {
    return (
      <HobbyDetailScreen
        hobbyId={currentScreen.hobbyId}
        onBack={handleBackFromDetail}
        onStartLearning={() => handleStartLearning(currentScreen.hobbyId)}
      />
    );
  }

  const renderActive = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <ExploreScreen
            onHobbyClick={handleHobbyClick}
          />
        );
      case 'profile':
        // For Phase 2, profile shows saved hobbies info
        return (
          <HomeScreen
            onHobbyClick={handleHobbyClick}
          />
        );
      default:
        return (
          <HomeScreen
            onHobbyClick={handleHobbyClick}
          />
        );
    }
  };

  return (
    <ResponsiveLayout activeTab={activeTab} onTabChange={(t) => setActiveTab(t as 'home' | 'explore' | 'profile')}>
      <View style={{ flex: 1 }}>{renderActive()}</View>
    </ResponsiveLayout>
  );
};

export default MainTabNavigator;
