/**
 * Lesson Screen - Phase 2: Learning Paths MVP
 * 
 * Displays individual lesson content with:
 * - Video lessons (opens YouTube)
 * - Article lessons (formatted text)
 * - Exercise lessons (step-by-step checklist)
 * - Challenge lessons (project goals)
 * - Mark as complete functionality
 * - Navigation to next lesson
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography, Spacing, Layout, BorderRadius } from '../constants/designSystem';
import { useLocalProgress } from '../hooks/useLocalProgress';
import Constants from 'expo-constants';

interface LessonScreenProps {
  hobbyId: string;
  moduleId: string;
  lessonId: string;
  onBack: () => void;
  onNavigateToLesson: (moduleId: string, lessonId: string) => void;
  onBackToCourse: () => void;
}

interface ExternalResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'tool' | 'community';
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  type: 'video' | 'article' | 'exercise' | 'challenge';
  duration: string;
  content: string;
  videoUrl?: string;
  exerciseInstructions?: string[];
  challengeGoal?: string;
  externalResources: ExternalResource[];
  moduleName?: string;
  moduleId?: string;
}

interface NextLessonInfo {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  hobbyId,
  moduleId,
  lessonId,
  onBack,
  onNavigateToLesson,
  onBackToCourse,
}) => {
  const { colors } = useTheme();
  const { isLessonCompleted, markLessonComplete, markLessonIncomplete } = useLocalProgress(hobbyId);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<NextLessonInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  // Fetch lesson
  useEffect(() => {
    const fetchLesson = async () => {
      if (!hobbyId || !lessonId) return;

      try {
        setIsLoading(true);
        const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/learning/${hobbyId}/lessons/${lessonId}`);
        const data = await response.json();

        if (data.success) {
          setLesson(data.data.lesson);
          setNextLesson(data.data.nextLesson);
        } else {
          setError(data.message || 'Failed to load lesson');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Unable to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
    setCheckedSteps(new Set());
  }, [hobbyId, lessonId]);

  const isComplete = isLessonCompleted(lessonId);

  const handleToggleComplete = async () => {
    if (isComplete) {
      await markLessonIncomplete(lessonId);
    } else {
      await markLessonComplete(lessonId);
    }
  };

  const handleCheckStep = (stepIndex: number) => {
    setCheckedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const openVideoUrl = async () => {
    if (lesson?.videoUrl) {
      try {
        await Linking.openURL(lesson.videoUrl);
      } catch (err) {
        console.error('Error opening video URL:', err);
      }
    }
  };

  const openResource = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Error opening URL:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading lesson...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            {error || 'Lesson not found'}
          </Text>
          <TouchableOpacity onPress={onBackToCourse} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: colors.primary }]}>
              ← Back to Course
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return { bg: '#fee2e2', text: '#b91c1c' };
      case 'article': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'exercise': return { bg: '#dcfce7', text: '#166534' };
      case 'challenge': return { bg: '#f3e8ff', text: '#7c3aed' };
      default: return { bg: colors.muted, text: colors.mutedForeground };
    }
  };

  const typeColors = getTypeColor(lesson.type);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBackToCourse} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.mutedForeground }]}>
            ← Back to Course
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.completeToggle,
            { backgroundColor: isComplete ? '#dcfce7' : colors.muted },
          ]}
          onPress={handleToggleComplete}
        >
          <Text style={[
            styles.completeToggleText,
            { color: isComplete ? '#166534' : colors.mutedForeground },
          ]}>
            {isComplete ? '✓ Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Module breadcrumb */}
        {lesson.moduleName && (
          <Text style={[styles.moduleName, { color: '#f59e0b' }]}>
            {lesson.moduleName}
          </Text>
        )}

        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          {lesson.title}
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          {lesson.description}
        </Text>

        {/* Type badge and duration */}
        <View style={styles.metaRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeColors.text }]}>
              {lesson.type === 'video' && '▶️ '}
              {lesson.type === 'article' && '📄 '}
              {lesson.type === 'exercise' && '✋ '}
              {lesson.type === 'challenge' && '🏆 '}
              {lesson.type}
            </Text>
          </View>
          <Text style={[styles.duration, { color: colors.mutedForeground }]}>
            ⏱️ {lesson.duration}
          </Text>
        </View>

        {/* Content Card */}
        <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Video button */}
          {lesson.type === 'video' && lesson.videoUrl && (
            <TouchableOpacity
              style={[styles.videoButton, { backgroundColor: '#ef4444' }]}
              onPress={openVideoUrl}
            >
              <Text style={styles.videoButtonIcon}>▶️</Text>
              <Text style={styles.videoButtonText}>Watch Video on YouTube</Text>
            </TouchableOpacity>
          )}

          {/* Article content */}
          {lesson.type === 'article' && lesson.content && (
            <View style={styles.articleContent}>
              {lesson.content.split('\n').map((line, index) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('### ')) {
                  return (
                    <Text key={index} style={[styles.heading3, { color: colors.foreground }]}>
                      {trimmed.slice(4)}
                    </Text>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <Text key={index} style={[styles.heading2, { color: colors.foreground }]}>
                      {trimmed.slice(3)}
                    </Text>
                  );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <Text key={index} style={[styles.listItem, { color: colors.foreground }]}>
                      • {trimmed.slice(2)}
                    </Text>
                  );
                }
                if (trimmed.length > 0) {
                  return (
                    <Text key={index} style={[styles.paragraph, { color: colors.foreground }]}>
                      {trimmed}
                    </Text>
                  );
                }
                return null;
              })}
            </View>
          )}

          {/* Video description */}
          {lesson.type === 'video' && lesson.content && (
            <Text style={[styles.paragraph, { color: colors.foreground }]}>
              {lesson.content}
            </Text>
          )}

          {/* Exercise instructions */}
          {lesson.type === 'exercise' && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Instructions
              </Text>
              <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
                {lesson.content}
              </Text>

              {lesson.exerciseInstructions && (
                <View style={styles.checklistContainer}>
                  {lesson.exerciseInstructions.map((instruction, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.checklistItem}
                      onPress={() => handleCheckStep(index)}
                    >
                      <View style={[
                        styles.checkbox,
                        {
                          backgroundColor: checkedSteps.has(index) ? '#f59e0b' : 'transparent',
                          borderColor: checkedSteps.has(index) ? '#f59e0b' : colors.border,
                        },
                      ]}>
                        {checkedSteps.has(index) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={[
                        styles.checklistText,
                        {
                          color: colors.foreground,
                          textDecorationLine: checkedSteps.has(index) ? 'line-through' : 'none',
                          opacity: checkedSteps.has(index) ? 0.5 : 1,
                        },
                      ]}>
                        {instruction}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Challenge content */}
          {lesson.type === 'challenge' && (
            <View>
              {lesson.challengeGoal && (
                <View style={[styles.challengeGoal, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={[styles.challengeGoalTitle, { color: '#7c3aed' }]}>
                    🎯 Challenge Goal
                  </Text>
                  <Text style={[styles.challengeGoalText, { color: '#6b21a8' }]}>
                    {lesson.challengeGoal}
                  </Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Steps to Complete
              </Text>

              {lesson.exerciseInstructions && (
                <View style={styles.checklistContainer}>
                  {lesson.exerciseInstructions.map((instruction, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.checklistItem}
                      onPress={() => handleCheckStep(index)}
                    >
                      <View style={[
                        styles.checkbox,
                        {
                          backgroundColor: checkedSteps.has(index) ? '#7c3aed' : 'transparent',
                          borderColor: checkedSteps.has(index) ? '#7c3aed' : colors.border,
                        },
                      ]}>
                        {checkedSteps.has(index) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={[
                        styles.checklistText,
                        {
                          color: colors.foreground,
                          textDecorationLine: checkedSteps.has(index) ? 'line-through' : 'none',
                          opacity: checkedSteps.has(index) ? 0.5 : 1,
                        },
                      ]}>
                        {instruction}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* External Resources */}
        {lesson.externalResources && lesson.externalResources.length > 0 && (
          <View style={[styles.resourcesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              📚 Additional Resources
            </Text>
            {lesson.externalResources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceItem}
                onPress={() => openResource(resource.url)}
              >
                <Text style={styles.resourceIcon}>
                  {resource.type === 'video' && '🎬'}
                  {resource.type === 'article' && '📄'}
                  {resource.type === 'tool' && '🛠️'}
                  {resource.type === 'community' && '👥'}
                </Text>
                <Text style={[styles.resourceTitle, { color: '#f59e0b' }]}>
                  {resource.title} →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Navigation Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={onBackToCourse}>
            <Text style={[styles.footerLink, { color: colors.mutedForeground }]}>
              ← Back to Course
            </Text>
          </TouchableOpacity>

          <View style={styles.footerButtons}>
            {!isComplete && (
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: '#f59e0b' }]}
                onPress={handleToggleComplete}
              >
                <Text style={styles.footerButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}

            {nextLesson && (
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: colors.primary }]}
                onPress={() => onNavigateToLesson(nextLesson.moduleId, nextLesson.id)}
              >
                <Text style={styles.footerButtonText}>Next Lesson →</Text>
              </TouchableOpacity>
            )}

            {!nextLesson && isComplete && (
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: '#22c55e' }]}
                onPress={onBackToCourse}
              >
                <Text style={styles.footerButtonText}>🎉 Course Complete!</Text>
              </TouchableOpacity>
            )}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  completeToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  completeToggleText: {
    fontSize: Typography.caption,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  moduleName: {
    fontSize: Typography.caption,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.body,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  duration: {
    fontSize: Typography.caption,
  },
  contentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  videoButtonIcon: {
    fontSize: 20,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: Typography.body,
    fontWeight: '600',
  },
  articleContent: {
    gap: Spacing.sm,
  },
  heading2: {
    fontSize: Typography.h3,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heading3: {
    fontSize: Typography.h4,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    fontSize: Typography.body,
    lineHeight: 24,
  },
  listItem: {
    fontSize: Typography.body,
    lineHeight: 24,
    paddingLeft: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  checklistContainer: {
    gap: Spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checklistText: {
    flex: 1,
    fontSize: Typography.body,
    lineHeight: 22,
  },
  challengeGoal: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  challengeGoalTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  challengeGoalText: {
    fontSize: Typography.body,
    lineHeight: 22,
  },
  resourcesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  resourceIcon: {
    fontSize: 20,
  },
  resourceTitle: {
    fontSize: Typography.body,
  },
  footer: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    marginTop: Spacing.md,
  },
  footerLink: {
    fontSize: Typography.body,
    marginBottom: Spacing.md,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  footerButton: {
    flex: 1,
    minWidth: 140,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: Typography.body,
    fontWeight: '600',
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});

export default LessonScreen;
