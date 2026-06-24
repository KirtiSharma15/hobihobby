/**
 * Learning Path Screen - Phase 2: Learning Paths MVP
 * 
 * Displays the learning path for a hobby with:
 * - Module overview with progress indicators
 * - Lesson list with completion status
 * - Continue where you left off
 * - Progress tracking (local storage)
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, Layout, BorderRadius } from '../constants/designSystem';
import { useLocalProgress } from '../hooks/useLocalProgress';
import Constants from 'expo-constants';

interface LearningPathScreenProps {
  hobbyId: string;
  onBack: () => void;
  onNavigateToLesson: (moduleId: string, lessonId: string) => void;
}

// Learning path types
interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  type: 'video' | 'article' | 'exercise' | 'challenge';
  duration: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  icon?: string;
  lessons: Lesson[];
}

interface LearningPath {
  id: string;
  hobbyId: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  totalLessons: number;
  modules: Module[];
}

const LESSON_TYPE_ICONS: Record<string, string> = {
  video: '▶️',
  article: '📄',
  exercise: '✋',
  challenge: '🏆',
};

export const LearningPathScreen: React.FC<LearningPathScreenProps> = ({
  hobbyId,
  onBack,
  onNavigateToLesson,
}) => {
  const { colors } = useTheme();
  const { progress, getCompletedLessons, isLessonCompleted } = useLocalProgress(hobbyId);

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch learning path
  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!hobbyId) return;

      try {
        setIsLoading(true);
        const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/learning/${hobbyId}`);
        const data = await response.json();

        if (data.success) {
          setLearningPath(data.data);
        } else {
          setError(data.message || 'Failed to load learning path');
        }
      } catch (err) {
        console.error('Error fetching learning path:', err);
        setError('Unable to load learning path');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningPath();
  }, [hobbyId]);

  // Calculate progress
  const completedLessons = getCompletedLessons();
  const totalLessons = learningPath?.totalLessons || 0;
  const progressPercent = totalLessons > 0
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0;

  // Find next incomplete lesson
  const getNextLesson = (): { moduleId: string; lessonId: string } | null => {
    if (!learningPath) return null;

    for (const module of learningPath.modules) {
      for (const lesson of module.lessons) {
        if (!isLessonCompleted(lesson.id)) {
          return { moduleId: module.id, lessonId: lesson.id };
        }
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading learning path...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !learningPath) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            {error || 'Learning path not found'}
          </Text>
          <TouchableOpacity onPress={onBack} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: colors.primary }]}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.mutedForeground }]}>
            ← Back to Hobby
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={[styles.difficultyBadge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.difficultyText, { color: '#166534' }]}>
              {learningPath.difficulty}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {learningPath.title}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {learningPath.description}
          </Text>
          <View style={styles.statsRow}>
            <Text style={[styles.stat, { color: colors.mutedForeground }]}>
              📚 {learningPath.modules.length} Modules
            </Text>
            <Text style={[styles.stat, { color: colors.mutedForeground }]}>
              📖 {learningPath.totalLessons} Lessons
            </Text>
            <Text style={[styles.stat, { color: colors.mutedForeground }]}>
              ⏱️ {learningPath.estimatedDuration}
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.progressTitle, { color: colors.foreground }]}>
                Your Progress
              </Text>
              <Text style={[styles.progressSubtitle, { color: colors.mutedForeground }]}>
                {completedLessons.length} of {totalLessons} lessons completed
              </Text>
            </View>
            <Text style={[styles.progressPercent, { color: '#f59e0b' }]}>
              {progressPercent}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%`, backgroundColor: '#f59e0b' },
              ]}
            />
          </View>

          {/* Continue Button */}
          {nextLesson ? (
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: '#f59e0b' }]}
              onPress={() => onNavigateToLesson(nextLesson.moduleId, nextLesson.lessonId)}
            >
              <Text style={styles.continueButtonText}>
                {completedLessons.length > 0 ? 'Continue Learning' : 'Start Learning'} →
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.completeBanner, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.completeBannerText, { color: '#166534' }]}>
                🎉 Congratulations! You've completed this course!
              </Text>
            </View>
          )}
        </View>

        {/* Modules List */}
        <View style={styles.modulesList}>
          {learningPath.modules.map((module, moduleIndex) => {
            const moduleLessonsComplete = module.lessons.filter((l) =>
              isLessonCompleted(l.id)
            ).length;
            const isModuleComplete = moduleLessonsComplete === module.lessons.length;

            return (
              <View
                key={module.id}
                style={[styles.moduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Module Header */}
                <View style={[styles.moduleHeader, { borderBottomColor: colors.border }]}>
                  <View style={[
                    styles.moduleIcon,
                    { backgroundColor: isModuleComplete ? '#dcfce7' : '#fef3c7' }
                  ]}>
                    <Text style={styles.moduleIconText}>
                      {isModuleComplete ? '✅' : (module.icon || `${moduleIndex + 1}`)}
                    </Text>
                  </View>
                  <View style={styles.moduleInfo}>
                    <View style={styles.moduleHeaderRow}>
                      <Text style={[styles.moduleTitle, { color: colors.foreground }]}>
                        Module {module.order}: {module.title}
                      </Text>
                      <Text style={[styles.moduleProgress, { color: colors.mutedForeground }]}>
                        {moduleLessonsComplete}/{module.lessons.length}
                      </Text>
                    </View>
                    <Text style={[styles.moduleDescription, { color: colors.mutedForeground }]}>
                      {module.description}
                    </Text>
                  </View>
                </View>

                {/* Lessons List */}
                {module.lessons.map((lesson) => {
                  const isComplete = isLessonCompleted(lesson.id);

                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[styles.lessonItem, { borderBottomColor: colors.border }]}
                      onPress={() => onNavigateToLesson(module.id, lesson.id)}
                    >
                      <View style={[
                        styles.lessonStatus,
                        {
                          backgroundColor: isComplete ? '#22c55e' : 'transparent',
                          borderColor: isComplete ? '#22c55e' : colors.border,
                        }
                      ]}>
                        <Text style={[
                          styles.lessonStatusText,
                          { color: isComplete ? '#fff' : colors.mutedForeground }
                        ]}>
                          {isComplete ? '✓' : lesson.order}
                        </Text>
                      </View>

                      <View style={styles.lessonInfo}>
                        <View style={styles.lessonTitleRow}>
                          <Text style={styles.lessonTypeIcon}>
                            {LESSON_TYPE_ICONS[lesson.type]}
                          </Text>
                          <Text
                            style={[
                              styles.lessonTitle,
                              { color: isComplete ? colors.mutedForeground : colors.foreground }
                            ]}
                            numberOfLines={1}
                          >
                            {lesson.title}
                          </Text>
                        </View>
                        <Text
                          style={[styles.lessonDescription, { color: colors.mutedForeground }]}
                          numberOfLines={1}
                        >
                          {lesson.description}
                        </Text>
                      </View>

                      <View style={styles.lessonMeta}>
                        <Text style={[styles.lessonDuration, { color: colors.mutedForeground }]}>
                          {lesson.duration}
                        </Text>
                        <Text style={[styles.lessonType, { color: colors.mutedForeground }]}>
                          {lesson.type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.h4,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  backLink: {
    padding: Spacing.sm,
  },
  backLinkText: {
    fontSize: Typography.body,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backButtonText: {
    fontSize: Typography.body,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.xl,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  difficultyText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.body,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  stat: {
    fontSize: Typography.caption,
  },
  progressCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  progressSubtitle: {
    fontSize: Typography.caption,
  },
  progressPercent: {
    fontSize: Typography.h2,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  continueButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: Typography.body,
    fontWeight: '600',
  },
  completeBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  completeBannerText: {
    fontSize: Typography.body,
    fontWeight: '500',
  },
  modulesList: {
    gap: Spacing.lg,
  },
  moduleCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIconText: {
    fontSize: 20,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  moduleTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  moduleProgress: {
    fontSize: Typography.caption,
  },
  moduleDescription: {
    fontSize: Typography.caption,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  lessonStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonStatusText: {
    fontSize: Typography.caption,
    fontWeight: '600',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  lessonTypeIcon: {
    fontSize: 14,
  },
  lessonTitle: {
    fontSize: Typography.body,
    fontWeight: '500',
    flex: 1,
  },
  lessonDescription: {
    fontSize: Typography.caption,
  },
  lessonMeta: {
    alignItems: 'flex-end',
  },
  lessonDuration: {
    fontSize: Typography.caption,
  },
  lessonType: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});

export default LearningPathScreen;
