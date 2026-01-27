/**
 * Explore Screen - Phase 1: Discovery-First MVP
 * 
 * Simple category browsing with filters.
 * Features:
 * - Browse by difficulty, time, budget
 * - Art & Craft category focus
 * - Local save functionality
 * - Clean, calming UI
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, Layout, BorderRadius } from '../constants/designSystem';
import HobbyCard from '../components/HobbyCard';
import { useLocalSavedHobbies } from '../hooks/useLocalSavedHobbies';
import { Hobby } from '../types';

interface ExploreScreenProps {
  onHobbyClick: (hobbyId: string) => void;
  onLikeHobby?: (hobbyId: string) => void;
  likedHobbies?: Set<string>;
}

// Art & Craft hobbies data (matches backend)
const ART_CRAFT_HOBBIES: Hobby[] = [
  {
    id: 'watercolor-painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    tags: ['creative', 'relaxing', 'art', 'painting'],
    rating: 4.8,
    reviewCount: 892,
    timeRequired: '45-90 min',
    cost: '$48-88',
  },
  {
    id: 'acrylic-painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork. Great for beginners.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    tags: ['creative', 'colorful', 'art', 'painting'],
    rating: 4.7,
    reviewCount: 756,
    timeRequired: '1-2 hours',
    cost: '$40-60',
  },
  {
    id: 'pottery-ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. Tactile and meditative.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    tags: ['creative', 'hands-on', 'meditative', 'craft'],
    rating: 4.9,
    reviewCount: 1245,
    timeRequired: '1-2 hours',
    cost: '$45-80',
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Creative and structured.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    tags: ['creative', 'precise', 'writing', 'art'],
    rating: 4.6,
    reviewCount: 567,
    timeRequired: '30-60 min',
    cost: '$23-32',
  },
  {
    id: 'hand-lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography. Develop your own unique style.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    tags: ['creative', 'typography', 'design', 'art'],
    rating: 4.7,
    reviewCount: 423,
    timeRequired: '30-60 min',
    cost: '$26-42',
  },
];

type FilterType = 'all' | 'quick' | 'moderate' | 'budget-friendly' | 'saved';

const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🎨' },
  { id: 'quick', label: 'Quick Start', icon: '⚡' },
  { id: 'budget-friendly', label: 'Budget-Friendly', icon: '💰' },
  { id: 'saved', label: 'Saved', icon: '❤️' },
];

const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onHobbyClick,
}) => {
  const { colors } = useTheme();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter hobbies based on selected filter
  const filteredHobbies = useMemo(() => {
    switch (activeFilter) {
      case 'quick':
        // Hobbies that can be done in 30-60 min
        return ART_CRAFT_HOBBIES.filter(h => 
          h.timeRequired?.includes('30') || h.timeRequired?.includes('45')
        );
      case 'budget-friendly':
        // Hobbies under $50 to start
        return ART_CRAFT_HOBBIES.filter(h => {
          const costMatch = h.cost?.match(/\$(\d+)/);
          if (costMatch) {
            return parseInt(costMatch[1]) < 50;
          }
          return false;
        });
      case 'saved':
        return ART_CRAFT_HOBBIES.filter(h => savedHobbies.has(h.id));
      default:
        return ART_CRAFT_HOBBIES;
    }
  }, [activeFilter, savedHobbies]);

  const handleSaveHobby = async (hobbyId: string) => {
    await toggleSaveHobby(hobbyId);
  };

  const renderFilter = (filter: typeof FILTERS[0]) => {
    const isActive = activeFilter === filter.id;
    return (
      <TouchableOpacity
        key={filter.id}
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setActiveFilter(filter.id)}
      >
        <Text style={styles.filterIcon}>{filter.icon}</Text>
        <Text
          style={[
            styles.filterLabel,
            { color: isActive ? '#FFFFFF' : colors.foreground },
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
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
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              Find your perfect creative hobby
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map(renderFilter)}
          </ScrollView>
        </View>

        <View style={styles.content}>
          {/* Results count */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
              {filteredHobbies.length} {filteredHobbies.length === 1 ? 'hobby' : 'hobbies'} found
            </Text>
          </View>

          {/* Hobbies Grid */}
          {filteredHobbies.length > 0 ? (
            <View style={styles.hobbiesGrid}>
              {filteredHobbies.map(renderHobbyCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyIcon]}>
                {activeFilter === 'saved' ? '💝' : '🔍'}
              </Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {activeFilter === 'saved' 
                  ? 'No saved hobbies yet' 
                  : 'No hobbies match this filter'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                {activeFilter === 'saved'
                  ? 'Tap the heart icon on any hobby to save it here'
                  : 'Try a different filter to explore more options'}
              </Text>
            </View>
          )}

          {/* About Section */}
          <View style={[styles.aboutSection, { backgroundColor: colors.muted }]}>
            <Text style={[styles.aboutTitle, { color: colors.foreground }]}>
              Why Art & Craft?
            </Text>
            <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
              Creative hobbies like painting, pottery, and calligraphy are perfect for 
              stress relief and self-expression. They require minimal physical energy 
              and can be practiced at home on your own schedule.
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
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
  },
  filtersContainer: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filtersContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterIcon: {
    fontSize: Typography.fontSize.sm,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsCount: {
    fontSize: Typography.fontSize.sm,
  },
  hobbiesGrid: {
    gap: Spacing.md,
  },
  hobbyCard: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  aboutSection: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  aboutTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});

export default ExploreScreen;
