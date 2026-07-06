/**
 * Feature Flags Configuration
 * 
 * Controls which features are enabled/disabled across the app.
 * Used to progressively enable features across phases.
 * 
 * Phase 1: Discovery-First MVP (LOCAL_SAVE, SIMPLE_BROWSE)
 * Phase 2: Learning Paths (LEARNING_PATHS, PROGRESS_TRACKING)
 * Phase 3: Community & Trust (AUTH_REQUIRED, CREATOR_PROFILES, WORKSHOPS)
 * Phase 5: AI Enhancement (AI_RECOMMENDATIONS)
 */

export interface FeatureFlags {
  // Phase 1 - Discovery MVP
  LOCAL_SAVE: boolean;
  SIMPLE_BROWSE: boolean;
  
  // Phase 2 - Learning Paths
  LEARNING_PATHS: boolean;
  PROGRESS_TRACKING: boolean;
  
  // Phase 3 - Community & Trust
  AUTH_REQUIRED: boolean;
  CREATOR_PROFILES: boolean;
  WORKSHOPS: boolean;
  
  // Phase 5 - AI Enhancement
  AI_RECOMMENDATIONS: boolean;
  
  // Quiz feature (disabled for Phase 1)
  ONBOARDING_QUIZ: boolean;
}

/**
 * Default feature flags for Phase 2 (Learning Paths MVP)
 */
export const FEATURES: FeatureFlags = {
  // Phase 1 - Enabled
  LOCAL_SAVE: true,
  SIMPLE_BROWSE: true,
  
  // Phase 2 - Enabled
  LEARNING_PATHS: true,
  PROGRESS_TRACKING: true,
  
  // Phase 3 - Disabled initially
  AUTH_REQUIRED: false,
  CREATOR_PROFILES: false,
  WORKSHOPS: false,
  
  // Phase 5 - Disabled initially
  AI_RECOMMENDATIONS: false,
  
  // Quiz - Disabled (discovery-first, no quiz needed)
  ONBOARDING_QUIZ: false,
};

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURES[feature] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): (keyof FeatureFlags)[] {
  return (Object.keys(FEATURES) as (keyof FeatureFlags)[]).filter(
    (key) => FEATURES[key]
  );
}

/**
 * Get all disabled features
 */
export function getDisabledFeatures(): (keyof FeatureFlags)[] {
  return (Object.keys(FEATURES) as (keyof FeatureFlags)[]).filter(
    (key) => !FEATURES[key]
  );
}

export default FEATURES;


