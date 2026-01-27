import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../constants/designSystem';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onTabChange,
  onClose,
}) => {
  const { colors } = useTheme();

  const mainTabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'hobbies', label: 'My Hobbies', icon: '📚' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const userProfile = {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    level: 'Hobbyist Explorer',
  };

  const renderTabButton = (tab: typeof mainTabs[0]) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? colors.primary + '20' : 'transparent',
            borderColor: isActive ? colors.primary : 'transparent',
          },
        ]}
        onPress={() => onTabChange(tab.id)}
      >
        <Text style={styles.tabIcon}>{tab.icon}</Text>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? colors.primary : colors.mutedForeground,
            },
          ]}
        >
          {tab.label}
        </Text>
        {tab.id === 'hobbies' && (
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.badgeText, { color: colors.secondaryForeground }]}>
              5
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSecondaryButton = (icon: string, label: string, badge?: string, badgeVariant?: 'secondary' | 'destructive') => (
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={() => {/* Handle secondary actions */}}
    >
      <Text style={styles.secondaryIcon}>{icon}</Text>
      <Text style={[styles.secondaryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                badgeVariant === 'destructive'
                  ? colors.destructive
                  : colors.secondary,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color:
                  badgeVariant === 'destructive'
                    ? colors.destructiveForeground
                    : colors.secondaryForeground,
              },
            ]}
          >
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.sidebar }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo and Brand */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Text style={[styles.logoText, { color: colors.primaryForeground }]}>
                H
              </Text>
            </View>
            <View style={styles.brandInfo}>
              <Text style={[styles.brandTitle, { color: colors.sidebarForeground }]}>
                HobiHobby
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.sidebarAccentForeground }]}>
                Discover & Learn
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.sidebarBorder }]} />

        {/* Navigation */}
        <View style={styles.navigation}>
          {mainTabs.map(renderTabButton)}

          <View style={[styles.separator, { backgroundColor: colors.sidebarBorder }]} />

          {/* Secondary Actions */}
          {renderSecondaryButton('🔔', 'Notifications', '3', 'destructive')}
          {renderSecondaryButton('⚙️', 'Settings')}
        </View>
      </ScrollView>

      <View style={[styles.separator, { backgroundColor: colors.sidebarBorder }]} />

      {/* User Profile */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.sidebarForeground }]}>
              {userProfile.name}
            </Text>
            <Text style={[styles.userLevel, { color: colors.sidebarAccentForeground }]}>
              {userProfile.level}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {/* Handle sign out */}}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={[styles.signOutText, { color: colors.mutedForeground }]}>
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: '100%',
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold as any,
  },
  brandInfo: {
    flex: 1,
  },
  brandTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold as any,
  },
  brandSubtitle: {
    fontSize: Typography.fontSize.xs,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.md,
  },
  navigation: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 44,
  },
  tabIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
    width: 20,
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minHeight: 44,
  },
  secondaryIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
    width: 20,
    textAlign: 'center',
  },
  secondaryLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
  userSection: {
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  userLevel: {
    fontSize: Typography.fontSize.xs,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  signOutIcon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.sm,
  },
  signOutText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
});

export default SidebarNavigation;



