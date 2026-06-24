/**
 * Lesson Page - Phase 2: Learning Paths MVP
 * 
 * Displays individual lesson content with:
 * - Video lessons (YouTube embed)
 * - Article lessons (Markdown content)
 * - Exercise lessons (Step-by-step instructions)
 * - Challenge lessons (Project goals and checklist)
 * - Mark as complete functionality
 * - Navigation to next lesson
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalProgress } from '@/hooks/useLocalProgress';
import { cn } from '@/utils/cn';

// Lesson types
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

// Helper to extract YouTube video ID
const getYouTubeEmbedUrl = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// Simple markdown-like rendering for articles
const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 my-4 text-gray-700">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          {trimmed.slice(3)}
        </h3>
      );
    }
    // List items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
    }
    // Bold text in paragraphs
    else if (trimmed.length > 0) {
      flushList();
      const formatted = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p 
          key={index} 
          className="text-gray-700 leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    }
  });
  
  flushList();
  return elements;
};

export const LessonPage: React.FC = () => {
  const { hobbyId, moduleId, lessonId } = useParams<{ 
    hobbyId: string; 
    moduleId: string; 
    lessonId: string; 
  }>();
  const navigate = useNavigate();
  const { isLessonCompleted, markLessonComplete, markLessonIncomplete } = useLocalProgress(hobbyId || '');

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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/learning/${hobbyId}/lessons/${lessonId}`);
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
    setCheckedSteps(new Set()); // Reset checked steps on lesson change
  }, [hobbyId, lessonId]);

  const isComplete = lessonId ? isLessonCompleted(lessonId) : false;

  const handleToggleComplete = () => {
    if (!lessonId) return;
    
    if (isComplete) {
      markLessonIncomplete(lessonId);
    } else {
      markLessonComplete(lessonId);
    }
  };

  const handleCheckStep = (stepIndex: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate(`/hobby/${hobbyId}/learn`)}
            className="text-amber-600 hover:text-amber-700"
          >
            ← Back to Learning Path
          </button>
        </div>
      </div>
    );
  }

  const embedUrl = lesson.videoUrl ? getYouTubeEmbedUrl(lesson.videoUrl) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/hobby/${hobbyId}/learn`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2">←</span>
              Back to Course
            </button>
            <button
              onClick={handleToggleComplete}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                isComplete 
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {isComplete ? '✓ Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module breadcrumb */}
        {lesson.moduleName && (
          <p className="text-sm text-amber-600 font-medium mb-2">
            {lesson.moduleName}
          </p>
        )}

        {/* Lesson Title */}
        <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
          {lesson.title}
        </h1>
        <p className="text-gray-600 mb-6">{lesson.description}</p>

        {/* Lesson type badge and duration */}
        <div className="flex items-center gap-3 mb-8">
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium capitalize',
            lesson.type === 'video' && 'bg-red-100 text-red-700',
            lesson.type === 'article' && 'bg-blue-100 text-blue-700',
            lesson.type === 'exercise' && 'bg-green-100 text-green-700',
            lesson.type === 'challenge' && 'bg-purple-100 text-purple-700',
          )}>
            {lesson.type === 'video' && '▶️'} 
            {lesson.type === 'article' && '📄'} 
            {lesson.type === 'exercise' && '✋'} 
            {lesson.type === 'challenge' && '🏆'} 
            {' '}{lesson.type}
          </span>
          <span className="text-sm text-gray-500">⏱️ {lesson.duration}</span>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          {/* Video content */}
          {lesson.type === 'video' && embedUrl && (
            <div className="aspect-video bg-black">
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Text content */}
          <div className="p-6">
            {/* Article content */}
            {lesson.type === 'article' && (
              <div className="prose max-w-none">
                {renderContent(lesson.content)}
              </div>
            )}

            {/* Video description */}
            {lesson.type === 'video' && lesson.content && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{lesson.content}</p>
              </div>
            )}

            {/* Exercise instructions */}
            {lesson.type === 'exercise' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Instructions
                </h3>
                <p className="text-gray-600 mb-6">{lesson.content}</p>
                
                {lesson.exerciseInstructions && (
                  <div className="space-y-3">
                    {lesson.exerciseInstructions.map((instruction, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checkedSteps.has(index)}
                          onChange={() => handleCheckStep(index)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className={cn(
                          'text-gray-700',
                          checkedSteps.has(index) && 'line-through text-gray-400'
                        )}>
                          {instruction}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Challenge content */}
            {lesson.type === 'challenge' && (
              <div>
                {lesson.challengeGoal && (
                  <div className="bg-purple-50 rounded-lg p-5 mb-6">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      🎯 Challenge Goal
                    </h3>
                    <p className="text-purple-800">{lesson.challengeGoal}</p>
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-4">
                  Steps to Complete
                </h3>
                
                {lesson.exerciseInstructions && (
                  <div className="space-y-3">
                    {lesson.exerciseInstructions.map((instruction, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checkedSteps.has(index)}
                          onChange={() => handleCheckStep(index)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className={cn(
                          'text-gray-700',
                          checkedSteps.has(index) && 'line-through text-gray-400'
                        )}>
                          {instruction}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* External Resources */}
        {lesson.externalResources && lesson.externalResources.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              📚 Additional Resources
            </h3>
            <div className="space-y-3">
              {lesson.externalResources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">
                    {resource.type === 'video' && '🎬'}
                    {resource.type === 'article' && '📄'}
                    {resource.type === 'tool' && '🛠️'}
                    {resource.type === 'community' && '👥'}
                  </span>
                  <span className="text-amber-600 hover:text-amber-700">
                    {resource.title} →
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/hobby/${hobbyId}/learn`)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Course
          </button>

          <div className="flex items-center gap-4">
            {!isComplete && (
              <button
                onClick={handleToggleComplete}
                className="px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
              >
                Mark as Complete
              </button>
            )}

            {nextLesson && (
              <Link
                to={`/hobby/${hobbyId}/learn/${nextLesson.moduleId}/${nextLesson.id}`}
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Next Lesson →
              </Link>
            )}

            {!nextLesson && isComplete && (
              <Link
                to={`/hobby/${hobbyId}/learn`}
                className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              >
                🎉 Course Complete!
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
