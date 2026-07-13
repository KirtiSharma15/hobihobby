/**
 * Learning Path Page - Phase 2: Learning Paths MVP
 * 
 * Displays the learning path for a hobby with:
 * - Module overview with progress indicators
 * - Lesson list with completion status
 * - Continue where you left off
 * - Progress tracking (local storage)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalProgress } from '@/hooks/useLocalProgress';
import { cn } from '@/utils/cn';
import { getLearningPath } from '@/data/learningPaths';
import type { LearningPath } from '@shared/types';
const LESSON_TYPE_ICONS: Record<string, string> = {
  video: '▶️',
  article: '📄',
  exercise: '✋',
  challenge: '🏆',
};

export const LearningPathPage: React.FC = () => {
  const { hobbyId } = useParams<{ hobbyId: string }>();
  const navigate = useNavigate();
  const { progress, getCompletedLessons, isLessonCompleted } = useLocalProgress(hobbyId || '');
  
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hobbyId) return;

    setIsLoading(true);
    const path = getLearningPath(hobbyId);
    if (path) {
      setLearningPath(path);
      setError(null);
    } else {
      setLearningPath(null);
      setError('Learning path not found for this hobby');
    }
    setIsLoading(false);
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
    return null; // All complete
  };

  const nextLesson = getNextLesson();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading learning path...</p>
        </div>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{error || 'Learning path not found'}</p>
          <button
            onClick={() => navigate(hobbyId ? `/hobby/${hobbyId}` : '/explore')}
            className="text-amber-600 hover:text-amber-700"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/hobby/${hobbyId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2">←</span>
              Back to Hobby
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-md capitalize mb-3">
            {learningPath.difficulty}
          </span>
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-3">
            {learningPath.title}
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            {learningPath.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📚 {learningPath.modules.length} Modules</span>
            <span>•</span>
            <span>📖 {learningPath.totalLessons} Lessons</span>
            <span>•</span>
            <span>⏱️ {learningPath.estimatedDuration}</span>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Your Progress</h2>
              <p className="text-sm text-gray-500">
                {completedLessons.length} of {totalLessons} lessons completed
              </p>
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {progressPercent}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Continue Button */}
          {nextLesson ? (
            <Link
              to={`/hobby/${hobbyId}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              {completedLessons.length > 0 ? 'Continue Learning' : 'Start Learning'} →
            </Link>
          ) : (
            <div className="text-center py-4 bg-emerald-50 rounded-lg">
              <span className="text-2xl mb-2">🎉</span>
              <p className="text-emerald-700 font-medium">Congratulations! You've completed this course!</p>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {learningPath.modules.map((module, moduleIndex) => {
            const moduleLessonsComplete = module.lessons.filter(l => 
              isLessonCompleted(l.id)
            ).length;
            const isModuleComplete = moduleLessonsComplete === module.lessons.length;

            return (
              <div 
                key={module.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Module Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl',
                      isModuleComplete ? 'bg-emerald-100' : 'bg-amber-100'
                    )}>
                      {isModuleComplete ? '✅' : (module.icon || `${moduleIndex + 1}`)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          Module {module.order}: {module.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {moduleLessonsComplete}/{module.lessons.length}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="divide-y divide-gray-100">
                  {module.lessons.map((lesson) => {
                    const isComplete = isLessonCompleted(lesson.id);
                    
                    return (
                      <Link
                        key={lesson.id}
                        to={`/hobby/${hobbyId}/learn/${module.id}/${lesson.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Completion indicator */}
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
                          isComplete 
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-gray-300 text-gray-400'
                        )}>
                          {isComplete ? '✓' : lesson.order}
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{LESSON_TYPE_ICONS[lesson.type]}</span>
                            <h4 className={cn(
                              'font-medium truncate',
                              isComplete ? 'text-gray-500' : 'text-gray-900'
                            )}>
                              {lesson.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {lesson.description}
                          </p>
                        </div>

                        {/* Duration & type */}
                        <div className="flex-shrink-0 text-right">
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                          <p className="text-xs text-gray-400 capitalize">{lesson.type}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
