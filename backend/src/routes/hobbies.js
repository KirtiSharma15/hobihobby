/**
 * Hobbies Routes - Phase 1: Discovery-First MVP
 * 
 * All routes are public. No authentication required.
 * Auth-protected routes commented out for Phase 2+.
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const hobbiesController = require('../controllers/hobbiesController');
const { saveHobby, unsaveHobby, getSavedHobbies } = require('../controllers/hobbiesController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Phase 1 - No Auth Required)
// ============================================

// Get all hobbies with search and filtering
router.get('/', authenticate, asyncHandler(hobbiesController.getAllHobbies));

// Get available categories
router.get('/categories', authenticate, asyncHandler(hobbiesController.getCategories));

// Get filter options (difficulties, time levels, budget levels)
router.get('/filters', authenticate, asyncHandler(hobbiesController.getFilterOptions));

// Saved hobbies (must be registered before /:id)
router.get('/saved', authenticate, getSavedHobbies);

// Get hobby by ID (includes full details for Phase 1)
router.get('/:id', authenticate, asyncHandler(hobbiesController.getHobbyById));

// Get related hobbies
router.get('/:id/related', authenticate, asyncHandler(hobbiesController.getRelatedHobbies));

// Recommendations endpoint (accepts answers in request body, no auth)
router.post('/recommendations', authenticate, asyncHandler(hobbiesController.getHobbyRecommendations));

// ============================================
// PHASE 2+ ROUTES (Disabled - Require Auth)
// ============================================

// const { body } = require('express-validator');
// const { validateRequest } = require('../middleware/validation');
// const { authenticateToken } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/:id/save', authenticate, saveHobby);
router.delete('/:id/save', authenticate, unsaveHobby);
// router.post('/:id/complete', authenticateToken, asyncHandler(hobbyController.completeHobby));
// router.post('/:id/rate', authenticateToken, rateHobbySchema, validateRequest, asyncHandler(hobbyController.rateHobby));
// router.post('/:id/review', authenticateToken, addReviewSchema, validateRequest, asyncHandler(hobbyController.addReview));

// Admin routes (require authentication and admin role)
// router.post('/', authenticateToken, createHobbySchema, validateRequest, asyncHandler(hobbyController.createHobby));
// router.put('/:id', authenticateToken, updateHobbySchema, validateRequest, asyncHandler(hobbyController.updateHobby));
// router.delete('/:id', authenticateToken, asyncHandler(hobbyController.deleteHobby));

module.exports = router;
