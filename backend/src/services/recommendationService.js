/**
 * Recommendation Service
 * Scores and recommends hobbies based on user quiz answers
 */

const { logger } = require('../utils/logger');

// Energy level numeric mapping for comparison
const ENERGY_LEVELS = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Calculate a match score between a hobby and user's onboarding answers
 * @param {Object} hobby - The hobby to score
 * @param {Object} answers - User's onboarding answers
 * @returns {number} Score from 0-100
 */
const scoreHobby = (hobby, answers) => {
  let score = 0;
  let maxScore = 0;

  // Physical Energy match (weight: 25)
  if (hobby.physicalEnergy && answers.physicalEnergy) {
    maxScore += 25;
    const hobbyLevel = ENERGY_LEVELS[hobby.physicalEnergy];
    const userLevel = ENERGY_LEVELS[answers.physicalEnergy];
    const diff = Math.abs(hobbyLevel - userLevel);
    
    if (diff === 0) {
      score += 25; // Perfect match
    } else if (diff === 1) {
      score += 15; // Close match
    } else {
      score += 5; // Distant match
    }
  }

  // Mental Energy match (weight: 25)
  if (hobby.mentalEnergy && answers.mentalEnergy) {
    maxScore += 25;
    const hobbyLevel = ENERGY_LEVELS[hobby.mentalEnergy];
    const userLevel = ENERGY_LEVELS[answers.mentalEnergy];
    const diff = Math.abs(hobbyLevel - userLevel);
    
    if (diff === 0) {
      score += 25;
    } else if (diff === 1) {
      score += 15;
    } else {
      score += 5;
    }
  }

  // Budget match (weight: 20)
  if (hobby.budgetLevel && answers.budget) {
    maxScore += 20;
    const hobbyLevel = ENERGY_LEVELS[hobby.budgetLevel];
    const userLevel = ENERGY_LEVELS[answers.budget];
    
    // User can afford if their budget >= hobby cost
    if (userLevel >= hobbyLevel) {
      score += 20;
    } else if (userLevel === hobbyLevel - 1) {
      score += 10; // Slightly over budget
    } else {
      score += 0; // Too expensive
    }
  }

  // Time match (weight: 20)
  if (hobby.timeLevel && answers.timeAvailable) {
    maxScore += 20;
    const hobbyLevel = ENERGY_LEVELS[hobby.timeLevel];
    const userLevel = ENERGY_LEVELS[answers.timeAvailable];
    
    // User has time if their availability >= hobby requirement
    if (userLevel >= hobbyLevel) {
      score += 20;
    } else if (userLevel === hobbyLevel - 1) {
      score += 10; // Slightly less time
    } else {
      score += 0; // Not enough time
    }
  }

  // Experience/Difficulty match (weight: 10)
  if (hobby.difficulty && answers.experience) {
    maxScore += 10;
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const hobbyDiff = difficultyMap[hobby.difficulty];
    const userExp = difficultyMap[answers.experience];
    
    // Hobby should be at or below user's experience level
    if (hobbyDiff <= userExp) {
      score += 10;
    } else if (hobbyDiff === userExp + 1) {
      score += 5; // Slightly challenging
    } else {
      score += 0; // Too advanced
    }
  }

  // Normalize to 0-100 scale
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
};

/**
 * Get recommended hobbies based on user's answers
 * @param {Array} hobbies - All available hobbies
 * @param {Object} answers - User's onboarding answers
 * @param {number} limit - Maximum number of recommendations (default 8)
 * @returns {Array} Scored and sorted hobbies
 */
const getRecommendations = (hobbies, answers, limit = 8) => {
  if (!hobbies || !Array.isArray(hobbies) || hobbies.length === 0) {
    logger.warn('No hobbies provided for recommendations');
    return [];
  }

  if (!answers) {
    logger.warn('No answers provided for recommendations, returning all hobbies');
    return hobbies.slice(0, limit);
  }

  // Score each hobby
  const scoredHobbies = hobbies.map(hobby => ({
    ...hobby,
    matchScore: scoreHobby(hobby, answers),
  }));

  // Sort by score descending
  scoredHobbies.sort((a, b) => b.matchScore - a.matchScore);

  // Return top matches
  const recommendations = scoredHobbies.slice(0, limit);
  
  logger.info(`Generated ${recommendations.length} recommendations for user`);
  
  return recommendations;
};

/**
 * Get match category based on score
 * @param {number} score - Match score (0-100)
 * @returns {string} Category label
 */
const getMatchCategory = (score) => {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'May Need More Time/Resources';
};

module.exports = {
  scoreHobby,
  getRecommendations,
  getMatchCategory,
  ENERGY_LEVELS,
};


