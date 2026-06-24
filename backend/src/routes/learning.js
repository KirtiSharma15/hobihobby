/**
 * Learning Routes - Phase 2
 * 
 * Routes for learning paths and lessons.
 * All routes are public (no auth required for Phase 2).
 */

const express = require('express');
const router = express.Router();

const learningController = require('../controllers/learningController');

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all learning paths (summaries)
router.get('/', asyncHandler(learningController.getAllPaths));

// Get learning path for a specific hobby
router.get('/:hobbyId', asyncHandler(learningController.getLearningPathByHobby));

// Get module details
router.get('/:hobbyId/modules/:moduleId', asyncHandler(learningController.getModuleById));

// Get specific lesson
router.get('/:hobbyId/lessons/:lessonId', asyncHandler(learningController.getLessonById));

module.exports = router;
