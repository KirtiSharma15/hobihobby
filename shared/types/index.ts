/**
 * Shared Types - Phase 1: Discovery-First MVP
 * 
 * Types for Phase 1 hobby discovery. Phase 2+ types (learning paths,
 * detailed progress tracking) are commented out.
 */

// ====================================
// Phase 1: Active Types
// ====================================

// Hobby related types
export interface Hobby {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeRequired: string;
  cost: string;
  imageUrl: string;
  starterKit?: StarterKit;
  tutorials?: Tutorial[];
  rating: number;
  reviewCount: number;
  isSaved?: boolean;
  isCompleted?: boolean;
  materials?: string[];
  steps?: string[];
  progress?: number;
  // Energy and level fields for recommendation matching
  physicalEnergy?: EnergyLevel;
  mentalEnergy?: EnergyLevel;
  budgetLevel?: EnergyLevel;
  timeLevel?: EnergyLevel;
  // Phase 1: Beginner steps (3-5 steps)
  beginnerSteps?: BeginnerStep[];
  // Phase 1: Intro video
  introVideoUrl?: string;
  // Phase 1: Beginner checklist
  beginnerChecklist?: string[];
}

export interface BeginnerStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string; // e.g., "15 min", "30 min"
  resources?: ExternalResource[];
}

export interface StarterKit {
  items: string[];
  estimatedCost: number;
  whereToBuy: string[];
}

export interface Tutorial {
  title: string;
  description: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExternalResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'tool' | 'community';
  description?: string;
}

export type EnergyLevel = 'low' | 'medium' | 'high';

// API related types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// UI related types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

// Storage interface for platform abstraction
export interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiGet(keys: string[]): Promise<[string, string | null][]>;
  multiSet(keyValuePairs: [string, string][]): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

// ====================================
// Phase 2+ Types (Commented Out)
// ====================================

// User related types - Enable in Phase 3 when auth is needed
/*
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  onboardingAnswers: OnboardingAnswers;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  interests: string[];
}

export interface OnboardingAnswers {
  experience: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable: EnergyLevel;
  budget: EnergyLevel;
  physicalEnergy: EnergyLevel;
  mentalEnergy: EnergyLevel;
  interests: string[];
  goals: string[];
}
*/

// Learning Path types - Enable in Phase 2
/*
export type LessonType = 'video' | 'article' | 'exercise' | 'challenge';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  content: string;
  externalResources: ExternalResource[];
  duration: string;
  type: LessonType;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  hobbyId: string;
  title: string;
  description: string;
  modules: Module[];
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserProgress {
  hobbyId: string;
  completedLessons: string[];
  currentModuleId: string | null;
  currentLessonId: string | null;
  startedAt: Date;
  lastActivityAt: Date;
  percentComplete: number;
}
*/
