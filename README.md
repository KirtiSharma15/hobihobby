# HobiHobby - AI-Powered Cross-Platform Hobby Discovery App

A professional, scalable AI-powered cross-platform application for discovering and managing hobbies, built with React Native (Expo) and Express.js.

## 🏗️ Project Structure

```
hobi-hobby/
├── frontend/           # React Native (Expo) mobile application
│   ├── src/           # Source code
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable UI components
│   ├── screens/       # Screen components
│   ├── navigation/    # Navigation configuration
│   ├── store/         # Redux store and slices
│   ├── services/      # API services and utilities
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── hooks/         # Custom React hooks
│   ├── features/      # Feature-based modules
│   ├── api/           # API client configuration
│   ├── App.tsx        # Main app component
│   ├── app.json       # Expo configuration
│   ├── package.json   # Frontend dependencies
│   └── tsconfig.json  # TypeScript configuration
├── backend/           # Express.js API server
│   ├── src/           # Source code
│   │   ├── config/    # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Custom middleware
│   │   ├── routes/    # API routes
│   │   ├── utils/     # Utility functions
│   │   └── server.js  # Main server file
│   ├── logs/          # Application logs
│   ├── uploads/       # File uploads
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
├── package.json       # Root package.json with workspace scripts
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Expo CLI (for mobile development)
- Firebase project with Authentication and Firestore enabled
- Stripe account for payment processing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hobi-hobby
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both:
- **Frontend**: Expo development server (http://localhost:8081)
- **Backend**: Express.js API server (http://localhost:3001)

## 📱 Mobile Development

### Frontend (React Native + Expo)

```bash
# Navigate to frontend directory
cd frontend

# Start Expo development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Build for production
npm run build
```

### Backend (Express.js)

```bash
# Navigate to backend directory
cd backend

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## 🛠️ Development Scripts

### Root Level Commands

```bash
# Development
npm run dev              # Start both frontend and backend in development
npm run start            # Start both frontend and backend in production

# Installation
npm run install:all      # Install dependencies for all projects

# Code Quality
npm run lint             # Lint both frontend and backend
npm run lint:fix         # Fix linting issues in both projects
npm run test             # Run tests for both projects

# Individual Project Commands
npm run frontend:dev     # Start frontend development server
npm run backend:dev      # Start backend development server
npm run frontend:build   # Build frontend for production
npm run backend:build    # Build backend for production
```

## 🔧 Technology Stack

### Frontend
- **React Native** with Expo for cross-platform development
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **Firebase** for authentication and real-time database
- **Axios** for HTTP requests
- **ESLint + Prettier** for code formatting

### Backend
- **Express.js** for API server
- **Firebase Admin SDK** for backend services
- **Stripe** for payment processing
- **Winston** for logging
- **Express-validator** for input validation
- **Helmet, CORS, Rate Limiting** for security
- **JWT** for authentication

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Hobbies
- `GET /api/hobbies` - Get all hobbies with search/filtering
- `GET /api/hobbies/:id` - Get specific hobby
- `POST /api/hobbies/:id/save` - Save hobby for user
- `POST /api/hobbies/:id/complete` - Mark hobby as completed

### Users
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/recommendations` - Get personalized recommendations

### Payments
- `POST /api/payments/subscriptions` - Create subscription
- `GET /api/payments/subscriptions` - Get user subscriptions

### Analytics (Admin Only)
- `GET /api/analytics/platform/users` - User growth analytics
- `GET /api/analytics/platform/revenue` - Revenue metrics

## 🔐 Security Features

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Data Sanitization**: Input sanitization and validation

## 📊 Monitoring & Analytics

- **Structured Logging**: Winston logger with file and console output
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Request timing and performance metrics
- **Health Checks**: `/health` endpoint for monitoring
- **Business Analytics**: User engagement, revenue, and conversion tracking

## 🚀 Deployment

### Frontend Deployment
- **Expo EAS Build**: For mobile app builds
- **Expo Application Services**: For app distribution
- **Web**: Deploy to Vercel, Netlify, or similar platforms

### Backend Deployment
- **Cloud Platforms**: Deploy to Heroku, Railway, or similar
- **VPS**: Deploy to DigitalOcean, AWS EC2, or similar
- **Container**: Docker deployment for scalability

### Environment Variables
Ensure all required environment variables are set in production for both frontend and backend.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the HobiHobby business platform** 