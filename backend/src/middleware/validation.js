const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validate request using express-validator
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));
    console.log('Validation errors:', errorMessages);
    console.log('Request body:', req.body);
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  
  next();
};

// Custom validation functions
const validateObjectId = (value) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error('Invalid email format');
  }
  return true;
};

const validatePassword = (password) => {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};

const validatePhoneNumber = (phone) => {
  const phonePattern = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phonePattern.test(phone)) {
    throw new Error('Invalid phone number format');
  }
  return true;
};

// Sanitization helpers
const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

const sanitizeObjectId = (id) => {
  return id.trim();
};

module.exports = {
  validateRequest,
  validateObjectId,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  sanitizeString,
  sanitizeEmail,
  sanitizeObjectId,
}; 