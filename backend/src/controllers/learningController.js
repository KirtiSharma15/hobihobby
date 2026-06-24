/**
 * Learning Controller - Phase 2
 * 
 * Handles learning path and lesson-related API requests.
 * Progress tracking is handled client-side (local storage) for Phase 2.
 */

const { 
  getLearningPath, 
  getAllLearningPaths, 
  getLesson,
  getNextLesson 
} = require('../data/learningPaths');

/**
 * Get learning path for a specific hobby
 * GET /api/learning/:hobbyId
 */
const getLearningPathByHobby = async (req, res) => {
  try {
    const { hobbyId } = req.params;
    const learningPath = getLearningPath(hobbyId);
    
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found for this hobby',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Learning path retrieved successfully',
      data: learningPath
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning path',
      error: error.message
    });
  }
};

/**
 * Get all available learning paths
 * GET /api/learning
 */
const getAllPaths = async (req, res) => {
  try {
    const paths = getAllLearningPaths();
    
    // Return summary info (not full lesson content)
    const summaries = paths.map(path => ({
      id: path.id,
      hobbyId: path.hobbyId,
      title: path.title,
      description: path.description,
      difficulty: path.difficulty,
      estimatedDuration: path.estimatedDuration,
      totalLessons: path.totalLessons,
      moduleCount: path.modules.length
    }));
    
    res.json({
      success: true,
      message: 'Learning paths retrieved successfully',
      data: summaries
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning paths',
      error: error.message
    });
  }
};

/**
 * Get a specific lesson
 * GET /api/learning/:hobbyId/lessons/:lessonId
 */
const getLessonById = async (req, res) => {
  try {
    const { hobbyId, lessonId } = req.params;
    const lesson = getLesson(hobbyId, lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
        data: null
      });
    }
    
    // Also get next lesson info
    const nextLesson = getNextLesson(hobbyId, lessonId);
    
    res.json({
      success: true,
      message: 'Lesson retrieved successfully',
      data: {
        lesson,
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title,
          moduleId: nextLesson.moduleId,
          moduleName: nextLesson.moduleName
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message
    });
  }
};

/**
 * Get module details
 * GET /api/learning/:hobbyId/modules/:moduleId
 */
const getModuleById = async (req, res) => {
  try {
    const { hobbyId, moduleId } = req.params;
    const learningPath = getLearningPath(hobbyId);
    
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found',
        data: null
      });
    }
    
    const module = learningPath.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Module retrieved successfully',
      data: module
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch module',
      error: error.message
    });
  }
};

module.exports = {
  getLearningPathByHobby,
  getAllPaths,
  getLessonById,
  getModuleById
};
