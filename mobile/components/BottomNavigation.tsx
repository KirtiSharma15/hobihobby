import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../constants/designSystem';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'hobbies', label: 'My Hobbies', icon: '📚' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const { colors } = useTheme();

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;

    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tab,
          {
            backgroundColor: isActive ? colors.primary + '20' : 'transparent',
          },
        ]}
        onPress={() => onTabChange(tab.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabIcon,
            { color: isActive ? colors.primary : colors.mutedForeground },
          ]}
        >
          {tab.icon}
        </Text>
        <Text
          style={[
            styles.tabLabel,
            { color: isActive ? colors.primary : colors.mutedForeground },
          ]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.xs,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tabIcon: {
    fontSize: Typography.fontSize.lg,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
});

export default BottomNavigation;
