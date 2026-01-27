const { getFirestore, isFirebaseConfigured } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { getRecommendations, getMatchCategory } = require('../services/recommendationService');
const { ART_CRAFT_HOBBIES, CATEGORIES, DIFFICULTIES, TIME_LEVELS, BUDGET_LEVELS } = require('../data/artCraftHobbies');

// Feature flag for Phase 1 (Art & Craft only)
const PHASE_1_ART_CRAFT_ONLY = true;

// Get hobbies based on current phase
const getActiveHobbies = () => {
  if (PHASE_1_ART_CRAFT_ONLY) {
    return ART_CRAFT_HOBBIES;
  }
  return MOCK_HOBBIES;
};

// Mock hobbies data for when Firebase is not configured (full list for future phases)
const MOCK_HOBBIES = [
  {
    id: '1',
    name: 'Photography',
    title: 'Photography',
    description: 'Capture beautiful moments and express your creativity through the lens. Learn composition, lighting, and editing.',
    category: 'Creative',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
    tags: ['art', 'outdoor', 'creative', 'visual'],
    rating: 4.8,
    reviewCount: 234,
    averageRating: 4.8,
    totalRatings: 234,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'medium',
    timeLevel: 'medium',
  },
  {
    id: '2',
    name: 'Hiking',
    title: 'Hiking',
    description: 'Explore nature trails and enjoy the great outdoors while staying fit. Discover scenic routes and challenge yourself.',
    category: 'Physical',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
    tags: ['outdoor', 'fitness', 'nature', 'adventure'],
    rating: 4.9,
    reviewCount: 456,
    averageRating: 4.9,
    totalRatings: 456,
    physicalEnergy: 'high',
    mentalEnergy: 'low',
    budgetLevel: 'low',
    timeLevel: 'medium',
  },
  {
    id: '3',
    name: 'Chess',
    title: 'Chess',
    description: 'Master the ancient game of strategy and improve your critical thinking. Play online or join local clubs.',
    category: 'Intellectual',
    difficulty: 'intermediate',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400',
    tags: ['strategy', 'mental', 'competitive', 'classic'],
    rating: 4.7,
    reviewCount: 189,
    averageRating: 4.7,
    totalRatings: 189,
    physicalEnergy: 'low',
    mentalEnergy: 'high',
    budgetLevel: 'low',
    timeLevel: 'medium',
  },
  {
    id: '4',
    name: 'Cooking',
    title: 'Cooking',
    description: 'Create delicious meals and explore cuisines from around the world. Impress friends and family with your skills.',
    category: 'Creative',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    tags: ['food', 'creative', 'social', 'practical'],
    rating: 4.6,
    reviewCount: 567,
    averageRating: 4.6,
    totalRatings: 567,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'medium',
    timeLevel: 'low',
  },
  {
    id: '5',
    name: 'Guitar',
    title: 'Guitar',
    description: 'Learn to play your favorite songs and express yourself through music. Acoustic or electric - your choice!',
    category: 'Creative',
    difficulty: 'intermediate',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    tags: ['music', 'creative', 'relaxing', 'performance'],
    rating: 4.8,
    reviewCount: 321,
    averageRating: 4.8,
    totalRatings: 321,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'medium',
    timeLevel: 'high',
  },
  {
    id: '6',
    name: 'Gardening',
    title: 'Gardening',
    description: 'Grow your own plants, vegetables, and create a beautiful outdoor space. Connect with nature at home.',
    category: 'Nature',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    tags: ['nature', 'relaxing', 'outdoor', 'sustainable'],
    rating: 4.5,
    reviewCount: 234,
    averageRating: 4.5,
    totalRatings: 234,
    physicalEnergy: 'medium',
    mentalEnergy: 'low',
    budgetLevel: 'low',
    timeLevel: 'medium',
  },
  {
    id: '7',
    name: 'Yoga',
    title: 'Yoga',
    description: 'Improve flexibility, strength, and mental clarity through ancient practices. Find your inner peace.',
    category: 'Physical',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    tags: ['fitness', 'mindfulness', 'flexibility', 'wellness'],
    rating: 4.9,
    reviewCount: 678,
    averageRating: 4.9,
    totalRatings: 678,
    physicalEnergy: 'medium',
    mentalEnergy: 'medium',
    budgetLevel: 'low',
    timeLevel: 'low',
  },
  {
    id: '8',
    name: 'Painting',
    title: 'Painting',
    description: 'Express yourself through colors and brush strokes. Explore watercolors, acrylics, or oils.',
    category: 'Creative',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
    tags: ['art', 'creative', 'relaxing', 'visual'],
    rating: 4.7,
    reviewCount: 445,
    averageRating: 4.7,
    totalRatings: 445,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'medium',
    timeLevel: 'medium',
  },
  {
    id: '9',
    name: 'Rock Climbing',
    title: 'Rock Climbing',
    description: 'Challenge yourself physically and mentally. Indoor or outdoor climbing adventures await.',
    category: 'Physical',
    difficulty: 'advanced',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400',
    tags: ['adventure', 'fitness', 'outdoor', 'challenge'],
    rating: 4.8,
    reviewCount: 289,
    averageRating: 4.8,
    totalRatings: 289,
    physicalEnergy: 'high',
    mentalEnergy: 'medium',
    budgetLevel: 'medium',
    timeLevel: 'medium',
  },
  {
    id: '10',
    name: 'Board Games',
    title: 'Board Games',
    description: 'Connect with friends and family through strategic and fun tabletop experiences.',
    category: 'Social',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400',
    tags: ['social', 'strategy', 'fun', 'indoor'],
    rating: 4.6,
    reviewCount: 512,
    averageRating: 4.6,
    totalRatings: 512,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'low',
    timeLevel: 'low',
  },
  {
    id: '11',
    name: 'Coding',
    title: 'Coding',
    description: 'Build apps, websites, and solve problems with programming. Learn Python, JavaScript, and more.',
    category: 'Technology',
    difficulty: 'intermediate',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
    tags: ['technology', 'creative', 'problem-solving', 'career'],
    rating: 4.7,
    reviewCount: 892,
    averageRating: 4.7,
    totalRatings: 892,
    physicalEnergy: 'low',
    mentalEnergy: 'high',
    budgetLevel: 'low',
    timeLevel: 'high',
  },
  {
    id: '12',
    name: 'Bird Watching',
    title: 'Bird Watching',
    description: 'Discover the fascinating world of birds in your area. A peaceful way to connect with nature.',
    category: 'Nature',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400',
    tags: ['nature', 'outdoor', 'relaxing', 'wildlife'],
    rating: 4.4,
    reviewCount: 156,
    averageRating: 4.4,
    totalRatings: 156,
    physicalEnergy: 'low',
    mentalEnergy: 'low',
    budgetLevel: 'low',
    timeLevel: 'medium',
  },
];

// Get all hobbies with search and filtering
const getAllHobbies = async (req, res) => {
  try {
    const { q, category, difficulty, budgetLevel, timeLevel, page = 1, limit = 20 } = req.query;
    
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      logger.info('Using mock hobbies data (Firebase not configured)');
      
      let hobbies = [...getActiveHobbies()];
      
      // Apply filters
      if (category) {
        hobbies = hobbies.filter(h => h.category === category);
      }
      if (difficulty) {
        hobbies = hobbies.filter(h => h.difficulty === difficulty);
      }
      if (budgetLevel) {
        hobbies = hobbies.filter(h => h.budgetLevel === budgetLevel);
      }
      if (timeLevel) {
        hobbies = hobbies.filter(h => h.timeLevel === timeLevel);
      }
      if (q) {
        const searchTerm = q.toLowerCase();
        hobbies = hobbies.filter(h => 
          h.name.toLowerCase().includes(searchTerm) ||
          h.description.toLowerCase().includes(searchTerm) ||
          h.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      const total = hobbies.length;
      const offset = (page - 1) * limit;
      const paginatedHobbies = hobbies.slice(offset, offset + parseInt(limit));
      
      return res.json({
        success: true,
        data: paginatedHobbies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
    
    const db = getFirestore();
    let query = db.collection('hobbies');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    // Get total count for pagination
    const snapshot = await query.get();
    const total = snapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(parseInt(limit)).offset(offset);

    const hobbiesSnapshot = await query.get();
    const hobbies = [];

    hobbiesSnapshot.forEach(doc => {
      const hobby = { id: doc.id, ...doc.data() };
      
      // Apply text search if query provided
      if (q) {
        const searchTerm = q.toLowerCase();
        const matchesSearch = 
          hobby.title.toLowerCase().includes(searchTerm) ||
          hobby.description.toLowerCase().includes(searchTerm) ||
          hobby.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        if (matchesSearch) {
          hobbies.push(hobby);
        }
      } else {
        hobbies.push(hobby);
      }
    });

    res.json({
      success: true,
      data: hobbies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get all hobbies error:', error);
    throw new AppError('Failed to fetch hobbies', 500);
  }
};

// Get hobby categories
const getCategories = async (req, res) => {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      logger.info('Using mock categories data (Firebase not configured)');
      return res.json({
        success: true,
        data: CATEGORIES,
      });
    }
    
    const db = getFirestore();
    const snapshot = await db.collection('categories').get();
    const categories = [];

    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    throw new AppError('Failed to fetch categories', 500);
  }
};

// Get filter options for UI
const getFilterOptions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        categories: CATEGORIES,
        difficulties: DIFFICULTIES,
        timeLevels: TIME_LEVELS,
        budgetLevels: BUDGET_LEVELS,
      },
    });
  } catch (error) {
    logger.error('Get filter options error:', error);
    throw new AppError('Failed to fetch filter options', 500);
  }
};

// Get hobby by ID
const getHobbyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      logger.info('Using mock hobbies data for getHobbyById (Firebase not configured)');
      
      const activeHobbies = getActiveHobbies();
      const hobby = activeHobbies.find(h => h.id === id);
      
      if (!hobby) {
        throw new AppError('Hobby not found', 404);
      }
      
      return res.json({
        success: true,
        data: hobby,
      });
    }
    
    const db = getFirestore();
    const doc = await db.collection('hobbies').doc(id).get();
    
    if (!doc.exists) {
      throw new AppError('Hobby not found', 404);
    }

    const hobby = { id: doc.id, ...doc.data() };

    res.json({
      success: true,
      data: hobby,
    });
  } catch (error) {
    logger.error('Get hobby by ID error:', error);
    throw error;
  }
};

// Get related hobbies
const getRelatedHobbies = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    
    const doc = await db.collection('hobbies').doc(id).get();
    
    if (!doc.exists) {
      throw new AppError('Hobby not found', 404);
    }

    const hobby = doc.data();
    
    // Find hobbies with similar category or tags
    const relatedQuery = db.collection('hobbies')
      .where('category', '==', hobby.category)
      .limit(5);
    
    const relatedSnapshot = await relatedQuery.get();
    const relatedHobbies = [];

    relatedSnapshot.forEach(doc => {
      if (doc.id !== id) {
        relatedHobbies.push({ id: doc.id, ...doc.data() });
      }
    });

    res.json({
      success: true,
      data: relatedHobbies,
    });
  } catch (error) {
    logger.error('Get related hobbies error:', error);
    throw error;
  }
};

// Create new hobby (admin only)
const createHobby = async (req, res) => {
  try {
    const { uid } = req.user;
    const hobbyData = req.body;
    const db = getFirestore();

    // Check if user is admin
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      throw new AppError('Insufficient permissions', 403);
    }

    const newHobby = {
      ...hobbyData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: uid,
      views: 0,
      saves: 0,
      completions: 0,
      averageRating: 0,
      totalRatings: 0,
    };

    const docRef = await db.collection('hobbies').add(newHobby);

    logger.info(`New hobby created: ${docRef.id} by user: ${uid}`);

    res.status(201).json({
      success: true,
      message: 'Hobby created successfully',
      data: { id: docRef.id, ...newHobby },
    });
  } catch (error) {
    logger.error('Create hobby error:', error);
    throw error;
  }
};

// Update hobby (admin only)
const updateHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const updateData = req.body;
    const db = getFirestore();

    // Check if user is admin
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      throw new AppError('Insufficient permissions', 403);
    }

    updateData.updatedAt = new Date();

    await db.collection('hobbies').doc(id).update(updateData);

    logger.info(`Hobby updated: ${id} by user: ${uid}`);

    res.json({
      success: true,
      message: 'Hobby updated successfully',
    });
  } catch (error) {
    logger.error('Update hobby error:', error);
    throw error;
  }
};

// Delete hobby (admin only)
const deleteHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const db = getFirestore();

    // Check if user is admin
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      throw new AppError('Insufficient permissions', 403);
    }

    await db.collection('hobbies').doc(id).delete();

    logger.info(`Hobby deleted: ${id} by user: ${uid}`);

    res.json({
      success: true,
      message: 'Hobby deleted successfully',
    });
  } catch (error) {
    logger.error('Delete hobby error:', error);
    throw error;
  }
};

// Save hobby for user
const saveHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const db = getFirestore();

    // Check if hobby exists
    const hobbyDoc = await db.collection('hobbies').doc(id).get();
    if (!hobbyDoc.exists) {
      throw new AppError('Hobby not found', 404);
    }

    // Add to user's saved hobbies
    await db.collection('users').doc(uid).update({
      savedHobbies: db.FieldValue.arrayUnion(id),
    });

    // Increment hobby saves count
    await db.collection('hobbies').doc(id).update({
      saves: db.FieldValue.increment(1),
    });

    logger.info(`Hobby saved: ${id} by user: ${uid}`);

    res.json({
      success: true,
      message: 'Hobby saved successfully',
    });
  } catch (error) {
    logger.error('Save hobby error:', error);
    throw error;
  }
};

// Unsave hobby for user
const unsaveHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const db = getFirestore();

    // Remove from user's saved hobbies
    await db.collection('users').doc(uid).update({
      savedHobbies: db.FieldValue.arrayRemove(id),
    });

    // Decrement hobby saves count
    await db.collection('hobbies').doc(id).update({
      saves: db.FieldValue.increment(-1),
    });

    logger.info(`Hobby unsaved: ${id} by user: ${uid}`);

    res.json({
      success: true,
      message: 'Hobby removed from saved list',
    });
  } catch (error) {
    logger.error('Unsave hobby error:', error);
    throw error;
  }
};

// Mark hobby as completed
const completeHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const db = getFirestore();

    // Check if hobby exists
    const hobbyDoc = await db.collection('hobbies').doc(id).get();
    if (!hobbyDoc.exists) {
      throw new AppError('Hobby not found', 404);
    }

    // Add to user's completed hobbies
    await db.collection('users').doc(uid).update({
      completedHobbies: db.FieldValue.arrayUnion(id),
    });

    // Increment hobby completions count
    await db.collection('hobbies').doc(id).update({
      completions: db.FieldValue.increment(1),
    });

    logger.info(`Hobby completed: ${id} by user: ${uid}`);

    res.json({
      success: true,
      message: 'Hobby marked as completed',
    });
  } catch (error) {
    logger.error('Complete hobby error:', error);
    throw error;
  }
};

// Rate hobby
const rateHobby = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { rating } = req.body;
    const db = getFirestore();

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Check if hobby exists
    const hobbyDoc = await db.collection('hobbies').doc(id).get();
    if (!hobbyDoc.exists) {
      throw new AppError('Hobby not found', 404);
    }

    const hobby = hobbyDoc.data();
    const currentTotal = hobby.averageRating * hobby.totalRatings;
    const newTotal = currentTotal + rating;
    const newCount = hobby.totalRatings + 1;
    const newAverage = newTotal / newCount;

    // Update hobby rating
    await db.collection('hobbies').doc(id).update({
      averageRating: newAverage,
      totalRatings: newCount,
    });

    // Store user rating
    await db.collection('ratings').doc(`${uid}_${id}`).set({
      userId: uid,
      hobbyId: id,
      rating,
      createdAt: new Date(),
    });

    logger.info(`Hobby rated: ${id} by user: ${uid} with rating: ${rating}`);

    res.json({
      success: true,
      message: 'Hobby rated successfully',
      data: { averageRating: newAverage, totalRatings: newCount },
    });
  } catch (error) {
    logger.error('Rate hobby error:', error);
    throw error;
  }
};

// Add review to hobby
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { review } = req.body;
    const db = getFirestore();

    if (!review || review.trim().length < 10) {
      throw new AppError('Review must be at least 10 characters long', 400);
    }

    // Check if hobby exists
    const hobbyDoc = await db.collection('hobbies').doc(id).get();
    if (!hobbyDoc.exists) {
      throw new AppError('Hobby not found', 404);
    }

    // Add review
    const reviewData = {
      userId: uid,
      hobbyId: id,
      review: review.trim(),
      createdAt: new Date(),
    };

    await db.collection('reviews').add(reviewData);

    logger.info(`Review added: ${id} by user: ${uid}`);

    res.json({
      success: true,
      message: 'Review added successfully',
    });
  } catch (error) {
    logger.error('Add review error:', error);
    throw error;
  }
};

// Get hobby recommendations based on user's onboarding answers
const getHobbyRecommendations = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    // Get user's onboarding answers from request body or query
    let answers = req.body;
    
    // If no body, try to get from authenticated user's profile
    if ((!answers || Object.keys(answers).length === 0) && req.user) {
      const { uid } = req.user;
      
      if (!isFirebaseConfigured()) {
        // Use localDb to get user profile
        const localDb = require('../services/localDb');
        const userProfile = localDb.getUserProfile(uid);
        answers = userProfile?.onboardingAnswers || {};
      } else {
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          answers = userDoc.data().onboardingAnswers || {};
        }
      }
    }

    // Get all hobbies
    let hobbies = [...getActiveHobbies()];
    
    if (isFirebaseConfigured()) {
      const db = getFirestore();
      const snapshot = await db.collection('hobbies').get();
      hobbies = [];
      snapshot.forEach(doc => {
        hobbies.push({ id: doc.id, ...doc.data() });
      });
    }

    // Get recommendations using the service
    const recommendations = getRecommendations(hobbies, answers, parseInt(limit));
    
    // Add match category to each recommendation
    const enrichedRecommendations = recommendations.map(hobby => ({
      ...hobby,
      matchCategory: getMatchCategory(hobby.matchScore),
    }));

    logger.info(`Generated ${enrichedRecommendations.length} recommendations`);

    res.json({
      success: true,
      data: enrichedRecommendations,
    });
  } catch (error) {
    logger.error('Get hobby recommendations error:', error);
    throw error;
  }
};

module.exports = {
  getAllHobbies,
  getCategories,
  getFilterOptions,
  getHobbyById,
  getRelatedHobbies,
  createHobby,
  updateHobby,
  deleteHobby,
  saveHobby,
  unsaveHobby,
  completeHobby,
  rateHobby,
  addReview,
  getHobbyRecommendations,
};








