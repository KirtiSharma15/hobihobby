import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import BottomNavigation from './BottomNavigation';
import SidebarNavigation from './SidebarNavigation';
import { Spacing } from '../constants/designSystem';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ResponsiveLayout({ children, activeTab, onTabChange }: ResponsiveLayoutProps) {
  const { colors } = useTheme();
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile Layout
    return (
      <View style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
        <View style={styles.mobileContent}>
          {children}
        </View>
        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </View>
    );
  }

  // Desktop Layout
  return (
    <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
      <SidebarNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <View style={styles.desktopContent}>
        <View style={styles.desktopInner}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
    position: 'relative',
  },
  mobileContent: {
    flex: 1,
    paddingBottom: 80, // Space for bottom navigation
  },
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  desktopContent: {
    flex: 1,
    overflow: 'auto',
  },
  desktopInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
});

export default ResponsiveLayout;
