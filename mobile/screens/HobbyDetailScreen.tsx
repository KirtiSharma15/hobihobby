/**
 * Hobby Detail Screen - Phase 1: Discovery-First MVP
 * 
 * Shows comprehensive hobby information without requiring commitment.
 * Features:
 * - What it is (description)
 * - Who it's for (personality fit)
 * - Starter checklist with costs
 * - First 3 beginner steps
 * - Intro video (YouTube link)
 * - Local save functionality
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, Layout, BorderRadius } from '../constants/designSystem';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useLocalSavedHobbies } from '../hooks/useLocalSavedHobbies';

interface HobbyDetailScreenProps {
  hobbyId: string;
  onBack: () => void;
  onLikeHobby?: (hobbyId: string) => void;
  likedHobbies?: Set<string>;
}

// Art & Craft hobby details (matches backend)
interface HobbyDetail {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  rating: number;
  reviewCount: number;
  personalityFit: string;
  starterChecklist: { item: string; cost: string; required: boolean }[];
  estimatedStarterCost: string;
  beginnerSteps: { step: number; title: string; description: string; duration: string; tip: string }[];
  introVideoUrl: string;
  introVideoTitle: string;
}

const HOBBY_DETAILS: Record<string, HobbyDetail> = {
  'watercolor-painting': {
    id: 'watercolor-painting',
    name: 'Watercolor Painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color and delicate brushwork.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    rating: 4.8,
    reviewCount: 892,
    personalityFit: 'Perfect for those who enjoy quiet, meditative activities and want to express themselves visually. Great for relaxation and stress relief.',
    starterChecklist: [
      { item: 'Watercolor paint set (12-24 colors)', cost: '$15-30', required: true },
      { item: 'Watercolor paper pad (9x12")', cost: '$10-15', required: true },
      { item: 'Round brushes set (sizes 2, 6, 10)', cost: '$10-20', required: true },
      { item: 'Water containers (2)', cost: '$5', required: true },
      { item: 'Paper towels or cloth', cost: '$3', required: true },
      { item: 'Palette or white plate', cost: '$5-10', required: false },
    ],
    estimatedStarterCost: '$48-88',
    beginnerSteps: [
      {
        step: 1,
        title: 'Learn Basic Washes',
        description: 'Practice creating flat washes and gradients. Wet your paper, load your brush with paint, and practice making even strokes across the page.',
        duration: '30-45 min',
        tip: 'Start with lots of water and less paint. You can always add more color, but cannot take it away.',
      },
      {
        step: 2,
        title: 'Practice Color Mixing',
        description: 'Learn to mix colors on your palette. Start with primary colors (red, blue, yellow) and create secondary colors.',
        duration: '30-45 min',
        tip: 'Keep a color chart of your mixes for reference.',
      },
      {
        step: 3,
        title: 'Paint a Simple Subject',
        description: 'Choose something simple like a fruit, leaf, or cloud. Use your wash and color mixing skills to create your first complete painting.',
        duration: '45-60 min',
        tip: 'Work from light to dark colors, letting each layer dry before adding the next.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=WVrsPoRo5oE',
    introVideoTitle: 'Watercolor Basics for Beginners',
  },
  'acrylic-painting': {
    id: 'acrylic-painting',
    name: 'Acrylic Painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork that dries quickly. Great for beginners who want to experiment freely.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    rating: 4.7,
    reviewCount: 756,
    personalityFit: 'Ideal for creative souls who like to experiment. Acrylics are forgiving and dry quickly, making them perfect for those who want immediate results.',
    starterChecklist: [
      { item: 'Acrylic paint set (12 colors)', cost: '$15-25', required: true },
      { item: 'Canvas boards or panels (3-pack)', cost: '$10-15', required: true },
      { item: 'Brush set (flat and round)', cost: '$10-15', required: true },
      { item: 'Palette or paper plates', cost: '$5', required: true },
      { item: 'Cup of water', cost: '$0', required: true },
      { item: 'Easel (tabletop)', cost: '$15-25', required: false },
    ],
    estimatedStarterCost: '$40-60',
    beginnerSteps: [
      {
        step: 1,
        title: 'Understand Paint Consistency',
        description: 'Experiment with thick (impasto) and thin (wash) applications. Try painting swatches with different amounts of water.',
        duration: '20-30 min',
        tip: 'Acrylics dry quickly, so work in small sections and keep your palette moist.',
      },
      {
        step: 2,
        title: 'Practice Brush Techniques',
        description: 'Learn flat strokes, dabbing, and blending. Practice creating gradients by blending two colors while wet.',
        duration: '30-45 min',
        tip: 'Clean your brushes immediately after use, as dried acrylic is hard to remove.',
      },
      {
        step: 3,
        title: 'Create Your First Painting',
        description: 'Paint a simple landscape or abstract piece. Start with the background, let it dry, then add foreground elements.',
        duration: '1-2 hours',
        tip: "Don't worry about mistakes - acrylics can be painted over once dry!",
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=oGPCDGwCpFg',
    introVideoTitle: 'Acrylic Painting for Complete Beginners',
  },
  'pottery-ceramics': {
    id: 'pottery-ceramics',
    name: 'Pottery & Ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. This tactile, meditative hobby connects you with an ancient craft and produces beautiful results.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    rating: 4.9,
    reviewCount: 1245,
    personalityFit: 'Perfect for those who love working with their hands and find peace in repetitive, focused tasks. Great for people who want something physical to show for their efforts.',
    starterChecklist: [
      { item: 'Air-dry clay (2-5 lbs)', cost: '$10-20', required: true },
      { item: 'Basic pottery tools set', cost: '$10-15', required: true },
      { item: 'Rolling pin or PVC pipe', cost: '$5-10', required: true },
      { item: 'Plastic sheets (to work on)', cost: '$5', required: true },
      { item: 'Sponge and water bowl', cost: '$5', required: true },
      { item: 'Acrylic paints for finishing', cost: '$10-15', required: false },
    ],
    estimatedStarterCost: '$45-80',
    beginnerSteps: [
      {
        step: 1,
        title: 'Condition Your Clay',
        description: 'Knead your clay to remove air bubbles and make it pliable. Roll it, fold it, and press it until smooth.',
        duration: '10-15 min',
        tip: 'If clay feels too dry, add a few drops of water while kneading.',
      },
      {
        step: 2,
        title: 'Make a Pinch Pot',
        description: 'Roll a ball of clay, push your thumb into the center, and pinch the walls while rotating. This is the simplest pottery form.',
        duration: '20-30 min',
        tip: 'Keep walls even thickness (about pencil-width) for best results.',
      },
      {
        step: 3,
        title: 'Create a Coil Pot',
        description: 'Roll clay into long coils and stack them in circles to build a pot. Smooth the inside and outside to blend.',
        duration: '45-60 min',
        tip: 'Score and slip (scratch and wet) surfaces before joining pieces.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=MaH2s2Hf7tI',
    introVideoTitle: 'Hand Building Pottery for Beginners',
  },
  'calligraphy': {
    id: 'calligraphy',
    name: 'Calligraphy & Lettering',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Calligraphy combines creativity with structure, producing elegant lettering.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    rating: 4.6,
    reviewCount: 567,
    personalityFit: 'Great for detail-oriented people who enjoy precision and practice. Perfect for those who want a calm, focused activity that produces shareable art.',
    starterChecklist: [
      { item: 'Brush pen set (3-4 pens)', cost: '$10-15', required: true },
      { item: 'Calligraphy practice pad', cost: '$8-12', required: true },
      { item: 'Guide sheets (printable)', cost: '$0-5', required: true },
      { item: 'Smooth cardstock (for projects)', cost: '$5-10', required: false },
      { item: 'Traditional dip pen and ink', cost: '$15-25', required: false },
    ],
    estimatedStarterCost: '$23-32',
    beginnerSteps: [
      {
        step: 1,
        title: 'Learn Basic Strokes',
        description: 'Practice the fundamental strokes: downstrokes (thick), upstrokes (thin), curves, and ovals.',
        duration: '30-45 min',
        tip: 'Apply pressure on downstrokes, release on upstrokes for classic thick/thin variation.',
      },
      {
        step: 2,
        title: 'Practice Lowercase Letters',
        description: 'Start with lowercase letters, grouping similar shapes together. Practice a-c-d-g-q, then n-m-h-b-p.',
        duration: '45-60 min',
        tip: 'Use guide sheets under your paper to keep letters consistent.',
      },
      {
        step: 3,
        title: 'Write Your First Word',
        description: 'Connect your letters to write simple words like "hello" or "love". Focus on consistent spacing.',
        duration: '30-45 min',
        tip: 'Slow down at connections between letters. Speed will come with practice.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=sBoVGqiSzr4',
    introVideoTitle: 'Calligraphy for Absolute Beginners',
  },
  'hand-lettering': {
    id: 'hand-lettering',
    name: 'Hand Lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography by hand. More freeform than calligraphy, hand lettering lets you develop your own unique style.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    rating: 4.7,
    reviewCount: 423,
    personalityFit: 'Perfect for creative people who want flexibility. Unlike strict calligraphy, hand lettering encourages personal style and experimentation.',
    starterChecklist: [
      { item: 'Pencil and eraser', cost: '$3-5', required: true },
      { item: 'Fine-tip markers (black)', cost: '$8-12', required: true },
      { item: 'Brush markers (assorted)', cost: '$10-15', required: true },
      { item: 'Sketch paper pad', cost: '$5-10', required: true },
      { item: 'Grid paper', cost: '$3-5', required: false },
      { item: 'Colored markers set', cost: '$15-25', required: false },
    ],
    estimatedStarterCost: '$26-42',
    beginnerSteps: [
      {
        step: 1,
        title: 'Sketch Letter Shapes',
        description: 'Start with pencil! Draw bubble letters, block letters, and script letters. Experiment with different widths.',
        duration: '30-45 min',
        tip: 'Draw letters lightly first so you can adjust before inking.',
      },
      {
        step: 2,
        title: 'Add Weight and Style',
        description: 'Choose which parts of letters will be thick vs thin. Add serifs, shadows, or decorative elements.',
        duration: '30-45 min',
        tip: 'Thicken all downstrokes for a classic look, or get creative with custom patterns.',
      },
      {
        step: 3,
        title: 'Ink Your Lettering',
        description: 'Trace over your pencil work with markers. Start with outlines, then fill in. Erase pencil marks after ink dries.',
        duration: '45-60 min',
        tip: 'Wait for ink to fully dry before erasing to avoid smudging.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=gGQcdIRSjMU',
    introVideoTitle: 'Hand Lettering for Beginners',
  },
};

const HobbyDetailScreen: React.FC<HobbyDetailScreenProps> = ({
  hobbyId,
  onBack,
}) => {
  const { colors } = useTheme();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'steps'>('overview');

  // Get hobby data
  const hobby = HOBBY_DETAILS[hobbyId] || HOBBY_DETAILS['watercolor-painting'];
  const isSaved = savedHobbies.has(hobby.id);

  const handleSave = async () => {
    await toggleSaveHobby(hobby.id);
  };

  const handleWatchVideo = () => {
    if (hobby.introVideoUrl) {
      Linking.openURL(hobby.introVideoUrl);
    }
  };

  const renderTabButton = (tab: 'overview' | 'checklist' | 'steps', label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tab ? colors.primary + '20' : 'transparent',
          borderColor: activeTab === tab ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: activeTab === tab ? colors.primary : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderChecklistItem = (item: { item: string; cost: string; required: boolean }, index: number) => (
    <View key={index} style={styles.checklistItem}>
      <View style={styles.checklistItemContent}>
        <View style={[
          styles.checklistDot,
          { backgroundColor: item.required ? colors.primary : colors.mutedForeground }
        ]} />
        <View style={styles.checklistItemText}>
          <Text style={[styles.checklistItemName, { color: colors.foreground }]}>
            {item.item}
          </Text>
          <Text style={[styles.checklistItemType, { color: colors.mutedForeground }]}>
            {item.required ? 'Required' : 'Optional'}
          </Text>
        </View>
      </View>
      <Text style={[styles.checklistItemCost, { color: colors.foreground }]}>
        {item.cost}
      </Text>
    </View>
  );

  const renderStep = (step: { step: number; title: string; description: string; duration: string; tip: string }) => (
    <Card key={step.step} variant="outlined" style={styles.stepCard}>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>{step.step}</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              {step.title}
            </Text>
            <View style={[styles.durationBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.durationText, { color: colors.mutedForeground }]}>
                ⏱️ {step.duration}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.stepDescription, { color: colors.mutedForeground }]}>
          {step.description}
        </Text>
        <View style={[styles.tipContainer, { backgroundColor: colors.chart1 + '15' }]}>
          <Text style={[styles.tipLabel, { color: colors.chart1 }]}>💡 Tip:</Text>
          <Text style={[styles.tipText, { color: colors.foreground }]}>{step.tip}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backIcon}>←</Text>
              <Text style={[styles.backText, { color: colors.foreground }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveIcon}>{isSaved ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: hobby.imageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.difficultyBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.difficultyText, { color: colors.primary }]}>
                {hobby.difficulty}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{hobby.title}</Text>
            <View style={styles.heroStats}>
              <Text style={styles.heroStat}>⭐ {hobby.rating}</Text>
              <Text style={styles.heroStat}>•</Text>
              <Text style={styles.heroStat}>{hobby.reviewCount} reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Video Button */}
          <Card variant="outlined" style={styles.videoCard}>
            <TouchableOpacity style={styles.videoContent} onPress={handleWatchVideo}>
              <View style={[styles.videoIcon, { backgroundColor: colors.destructive }]}>
                <Text style={styles.videoIconText}>▶️</Text>
              </View>
              <View style={styles.videoInfo}>
                <Text style={[styles.videoLabel, { color: colors.mutedForeground }]}>
                  Watch Introduction
                </Text>
                <Text style={[styles.videoTitle, { color: colors.foreground }]}>
                  {hobby.introVideoTitle}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabsList}>
              {renderTabButton('overview', 'Overview')}
              {renderTabButton('checklist', 'What You Need')}
              {renderTabButton('steps', 'First Steps')}
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === 'overview' && (
                <View style={styles.overviewContent}>
                  <View style={styles.overviewSection}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                      What is {hobby.name}?
                    </Text>
                    <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>
                      {hobby.description}
                    </Text>
                  </View>
                  
                  <View style={styles.overviewSection}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                      Who is it for?
                    </Text>
                    <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>
                      {hobby.personalityFit}
                    </Text>
                  </View>

                  <View style={[styles.costSummary, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>
                      Estimated cost to start:
                    </Text>
                    <Text style={[styles.costValue, { color: colors.foreground }]}>
                      {hobby.estimatedStarterCost}
                    </Text>
                  </View>
                </View>
              )}

              {activeTab === 'checklist' && (
                <View style={styles.checklistContent}>
                  <Text style={[styles.checklistIntro, { color: colors.mutedForeground }]}>
                    Here's everything you need to get started. Required items are marked with a dot.
                  </Text>
                  <View style={styles.checklistList}>
                    {hobby.starterChecklist.map(renderChecklistItem)}
                  </View>
                  <View style={[styles.costSummary, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>
                      Total estimated cost:
                    </Text>
                    <Text style={[styles.costValue, { color: colors.foreground }]}>
                      {hobby.estimatedStarterCost}
                    </Text>
                  </View>
                </View>
              )}

              {activeTab === 'steps' && (
                <View style={styles.stepsContent}>
                  <Text style={[styles.stepsIntro, { color: colors.mutedForeground }]}>
                    Start with these 3 beginner-friendly steps. Take your time with each one.
                  </Text>
                  <View style={styles.stepsList}>
                    {hobby.beginnerSteps.map(renderStep)}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Save CTA */}
          <View style={styles.ctaContainer}>
            <Button
              variant={isSaved ? 'outline' : 'default'}
              size="lg"
              onPress={handleSave}
            >
              {isSaved ? 'Saved to My Hobbies ❤️' : 'Save This Hobby'}
            </Button>
            <Text style={[styles.ctaSubtext, { color: colors.mutedForeground }]}>
              Save hobbies to find them easily later
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
    paddingTop: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.xs,
  },
  backText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  saveButton: {
    padding: Spacing.sm,
  },
  saveIcon: {
    fontSize: Typography.fontSize.xl,
  },
  heroContainer: {
    position: 'relative',
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  heroContent: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Layout.screenPadding,
    right: Layout.screenPadding,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  difficultyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
    textTransform: 'capitalize' as any,
  },
  heroTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold as any,
    color: 'white',
    marginBottom: Spacing.xs,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroStat: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  videoCard: {
    marginBottom: Spacing.lg,
  },
  videoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  videoIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  videoIconText: {
    fontSize: Typography.fontSize.lg,
  },
  videoInfo: {
    flex: 1,
  },
  videoLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs,
  },
  videoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
  },
  tabsContainer: {
    marginBottom: Spacing.lg,
  },
  tabsList: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  tabContent: {
    minHeight: 200,
  },
  overviewContent: {},
  overviewSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  costSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  costLabel: {
    fontSize: Typography.fontSize.base,
  },
  costValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold as any,
  },
  checklistContent: {},
  checklistIntro: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  checklistList: {
    gap: Spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  checklistItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checklistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  checklistItemText: {
    flex: 1,
  },
  checklistItemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: 2,
  },
  checklistItemType: {
    fontSize: Typography.fontSize.sm,
  },
  checklistItemCost: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    marginLeft: Spacing.md,
  },
  stepsContent: {},
  stepsIntro: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  stepsList: {
    gap: Spacing.md,
  },
  stepCard: {
    marginBottom: Spacing.md,
  },
  stepContent: {
    padding: Spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: 'white',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold as any,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: Spacing.xs,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    fontSize: Typography.fontSize.xs,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    marginBottom: Spacing.md,
  },
  tipContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  ctaContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  ctaSubtext: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});

export default HobbyDetailScreen;
