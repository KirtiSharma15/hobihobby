const { verifyIdToken, isFirebaseConfigured } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { logger } = require('../utils/logger');

// Authenticate Firebase ID token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(new AppError('Access token required', 401));
    }

    const useLocal = !isFirebaseConfigured();
    if (useLocal) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
        req.user = { uid: payload.uid, email: payload.email };
        return next();
      } catch (error) {
        logger.error('Local JWT verification failed:', error);
        return next(new AppError('Invalid or expired token', 401));
      }
    } else {
      try {
        const decodedToken = await verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          ...decodedToken,
        };
        next();
      } catch (error) {
        logger.error('Token verification failed:', error);
        return next(new AppError('Invalid or expired token', 401));
      }
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    next(error);
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const useLocal = !isFirebaseConfigured();
      if (useLocal) {
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
          req.user = { uid: payload.uid, email: payload.email };
        } catch (error) {
          logger.warn('Optional local auth failed:', error.message);
        }
      } else {
        try {
          const decodedToken = await verifyIdToken(token);
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
            ...decodedToken,
          };
        } catch (error) {
          // Token is invalid, but we don't fail the request
          logger.warn('Optional auth failed:', error.message);
        }
      }
    }
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(error);
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userRole = req.user.role || 'user';
    if (!roles.includes(userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Check if user owns the resource
const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (req.user.uid !== resourceUserId && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership,
}; 