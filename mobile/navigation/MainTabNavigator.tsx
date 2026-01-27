/**
 * Main Tab Navigator - Phase 1: Discovery-First MVP
 * 
 * No authentication required. Simple tab navigation
 * between Home, Explore, and Profile screens.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ResponsiveLayout from '../components/ResponsiveLayout';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import HobbyDetailScreen from '../screens/HobbyDetailScreen';
import { RootStackParamList } from './RootNavigator';

type MainNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'profile'>('home');
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(null);
  const navigation = useNavigation<MainNavigationProp>();

  const handleHobbyClick = (hobbyId: string) => {
    setSelectedHobbyId(hobbyId);
  };

  const handleBackFromDetail = () => {
    setSelectedHobbyId(null);
  };

  // If a hobby is selected, show its detail screen
  if (selectedHobbyId) {
    return (
      <HobbyDetailScreen
        hobbyId={selectedHobbyId}
        onBack={handleBackFromDetail}
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
        // For Phase 1, profile shows saved hobbies info
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
