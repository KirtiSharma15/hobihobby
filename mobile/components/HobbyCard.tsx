import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Hobby } from '../types';
import { Typography, Spacing, BorderRadius } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';

interface HobbyCardProps {
  hobby: Hobby;
  onPress: () => void;
  onSave?: () => void;
  style?: ViewStyle;
}

const HobbyCard: React.FC<HobbyCardProps> = ({ hobby, onPress, onSave, style }) => {
  const { colors } = useTheme();

  const handleSavePress = (e: any) => {
    e.stopPropagation();
    onSave?.();
  };

  const renderTags = () => {
    return hobby.tags.slice(0, 2).map((tag, index) => (
      <View key={index} style={[styles.tag, { backgroundColor: colors.muted }]}>
        <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
      </View>
    ));
  };

  const renderDifficulty = () => {
    const difficultyColors = {
      beginner: colors.chart1,
      intermediate: colors.chart4,
      advanced: colors.destructive,
    };

    return (
      <View style={[styles.difficulty, { backgroundColor: difficultyColors[hobby.difficulty] }]}>
        <Text style={styles.difficultyText}>{hobby.difficulty}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <Card variant="default">
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hobby.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {onSave && (
          <TouchableOpacity 
            style={[styles.savedBadge, { backgroundColor: hobby.isSaved ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)' }]}
            onPress={handleSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.savedText}>{hobby.isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {hobby.title}
        </Text>
        
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {hobby.description}
        </Text>
        
        <View style={styles.meta}>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: colors.foreground }]}>⭐ {hobby.rating.toFixed(1)}</Text>
            <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>({hobby.reviewCount})</Text>
          </View>
          {renderDifficulty()}
        </View>
        
        <View style={styles.tagsContainer}>
          {renderTags()}
        </View>
        
        <View style={styles.details}>
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>⏱️ {hobby.timeRequired}</Text>
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>💰 {hobby.cost}</Text>
        </View>
      </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
  },
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  savedText: {
    fontSize: 16,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.lg,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: Typography.fontSize.xs,
    marginRight: Spacing.xs,
  },
  reviewCount: {
    fontSize: Typography.fontSize.xs,
  },
  difficulty: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  difficultyText: {
    fontSize: Typography.fontSize.xs - 2,
    color: 'white',
    fontWeight: Typography.fontWeight.bold as any,
    textTransform: 'capitalize' as any,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  tagText: {
    fontSize: Typography.fontSize.xs - 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: Typography.fontSize.xs,
  },
});

export default HobbyCard;

