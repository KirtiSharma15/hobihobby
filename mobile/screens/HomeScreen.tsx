/**
 * Home Screen - Phase 1: Discovery-First MVP
 * 
 * Clean, calming interface focused on hobby discovery.
 * Features:
 * - Art & Craft hobbies only
 * - Local save functionality (no auth required)
 * - "My Saved Hobbies" section
 * - Simple filtering by difficulty, time, budget
 * - No gamification, stats, or pressure
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, Layout, BorderRadius } from '../constants/designSystem';
import HobbyCard from '../components/HobbyCard';
import { useLocalSavedHobbies } from '../hooks/useLocalSavedHobbies';
import { Hobby } from '../types';

interface HomeScreenProps {
  onHobbyClick: (hobbyId: string) => void;
  onLikeHobby?: (hobbyId: string) => void;
  likedHobbies?: Set<string>;
}

// Art & Craft hobbies data (matches backend)
const ART_CRAFT_HOBBIES: Hobby[] = [
  {
    id: 'watercolor-painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color and delicate brushwork.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    tags: ['creative', 'relaxing', 'art', 'painting'],
    rating: 4.8,
    reviewCount: 892,
    timeRequired: '45-90 min sessions',
    cost: '$48-88 to start',
  },
  {
    id: 'acrylic-painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork that dries quickly. Great for beginners who want to experiment freely.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    tags: ['creative', 'colorful', 'art', 'painting'],
    rating: 4.7,
    reviewCount: 756,
    timeRequired: '1-2 hour sessions',
    cost: '$40-60 to start',
  },
  {
    id: 'pottery-ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. This tactile, meditative hobby connects you with an ancient craft and produces beautiful results.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    tags: ['creative', 'hands-on', 'meditative', 'craft'],
    rating: 4.9,
    reviewCount: 1245,
    timeRequired: '1-2 hour sessions',
    cost: '$45-80 to start',
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Calligraphy combines creativity with structure, producing elegant lettering.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    tags: ['creative', 'precise', 'writing', 'art'],
    rating: 4.6,
    reviewCount: 567,
    timeRequired: '30-60 min sessions',
    cost: '$23-32 to start',
  },
  {
    id: 'hand-lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography by hand. More freeform than calligraphy, hand lettering lets you develop your own unique style.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    tags: ['creative', 'typography', 'design', 'art'],
    rating: 4.7,
    reviewCount: 423,
    timeRequired: '30-60 min sessions',
    cost: '$26-42 to start',
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({
  onHobbyClick,
}) => {
  const { colors } = useTheme();
  const { 
    savedHobbies, 
    isLoading: isSavedLoading, 
    toggleSaveHobby, 
    getSavedCount 
  } = useLocalSavedHobbies();
  
  const [hobbies] = useState<Hobby[]>(ART_CRAFT_HOBBIES);

  // Get saved hobbies for display
  const savedHobbyList = hobbies.filter(h => savedHobbies.has(h.id));
  const savedCount = getSavedCount();

  const handleSaveHobby = async (hobbyId: string) => {
    await toggleSaveHobby(hobbyId);
  };

  const renderHobbyCard = (hobby: Hobby) => (
    <HobbyCard
      key={hobby.id}
      hobby={{
        ...hobby,
        isSaved: savedHobbies.has(hobby.id),
      }}
      onPress={() => onHobbyClick(hobby.id)}
      onSave={() => handleSaveHobby(hobby.id)}
      style={styles.hobbyCard}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.greeting, { color: colors.foreground }]}>
              Discover Your Hobby
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Explore creative hobbies at your own pace
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Saved Hobbies Section - Only show if there are saved hobbies */}
          {savedCount > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    My Saved Hobbies
                  </Text>
                  <View style={[styles.savedBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.savedBadgeText, { color: colors.primary }]}>
                      {savedCount} saved
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.hobbiesGrid}>
                {savedHobbyList.map(renderHobbyCard)}
              </View>
            </View>
          )}

          {/* All Hobbies Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Art & Craft Hobbies
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                Perfect for beginners seeking creative fulfillment
              </Text>
            </View>
            <View style={styles.hobbiesGrid}>
              {hobbies.map(renderHobbyCard)}
            </View>
          </View>

          {/* Calming footer message */}
          <View style={styles.footerMessage}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Take your time. There's no rush to choose.
            </Text>
            <Text style={[styles.footerSubtext, { color: colors.mutedForeground }]}>
              Save hobbies that interest you and explore when you're ready.
            </Text>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  greeting: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  savedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  savedBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
  hobbiesGrid: {
    gap: Spacing.md,
  },
  hobbyCard: {
    marginBottom: Spacing.md,
  },
  footerMessage: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});

export default HomeScreen;
