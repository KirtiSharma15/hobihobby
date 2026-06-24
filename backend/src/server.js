const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes (Phase 2: Hobbies + Learning)
const hobbyRoutes = require('./routes/hobbies');
const learningRoutes = require('./routes/learning');
const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const paymentRoutes = require('./routes/payments');
// const analyticsRoutes = require('./routes/analytics');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
// Initialize Firebase early to avoid lazy-initialization races (skips if no creds)
try {
  const { initializeFirebase } = require('./config/firebase');
  initializeFirebase();
} catch (e) {
  logger.error('Firebase initialization failed at startup:', e);
}
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// CORS configuration (supports multiple origins via FRONTEND_URLS="http://a:port,http://b:port")
const rawAllowedOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:8081';
const allowedOrigins = rawAllowedOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

app.use(cors({
  origin: isProduction
    ? (origin, callback) => {
        // Allow non-browser requests (no origin) and CLI tools
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    : true, // In development, reflect the request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
}));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes (Phase 2: Hobbies + Learning)
app.use('/api/hobbies', hobbyRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 HobiHobby Backend Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 