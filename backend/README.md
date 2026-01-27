# HobiHobby Backend API

A professional, scalable backend API for the HobiHobby business application built with Express.js, Firebase, and modern Node.js practices.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Firebase Auth integration with JWT tokens
- **User Management**: Complete user profile and preference management
- **Hobby Management**: CRUD operations for hobbies with search and filtering
- **Payment Processing**: Stripe integration for subscriptions and payments
- **Analytics**: Comprehensive business analytics and user behavior tracking
- **File Upload**: Image and file handling with optimization
- **Email Notifications**: Automated email system for user engagement

### Business Features
- **Subscription Management**: Premium content and subscription handling
- **Revenue Analytics**: Business metrics and financial reporting
- **User Engagement**: Activity tracking and retention analysis
- **Content Performance**: Hobby popularity and content optimization
- **Search Analytics**: User search behavior and trend analysis

### Technical Features
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston-based structured logging
- **Error Handling**: Comprehensive error management and monitoring
- **Performance**: Compression, caching, and optimization
- **Scalability**: Modular architecture for easy scaling

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- Firebase project with Authentication and Firestore enabled
- Stripe account for payment processing
- MongoDB (optional, for additional data storage)
- Redis (optional, for caching)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hobi-hobby/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Other configurations...
   ```

4. **Initialize Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Download service account key and update environment variables
   - Set up Firestore security rules

5. **Set up Stripe**
   - Create a Stripe account
   - Get API keys from dashboard
   - Set up webhook endpoints
   - Configure subscription products

## 🚀 Running the Application

### Development
```bash
npm run dev
```

If you do not have a Firebase account, the backend supports a local development auth mode automatically when Firebase credentials are not provided. In this mode, users are stored in-memory and JWTs are issued using `JWT_SECRET`.

Set (optional) development secrets in `.env`:
```env
JWT_SECRET=dev-secret-change-me
FRONTEND_URLS=http://localhost:8081,http://localhost:8082
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── firebase.js  # Firebase configuration
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── hobbyController.js
│   │   ├── userController.js
│   │   ├── paymentController.js
│   │   └── analyticsController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Data models (if using MongoDB)
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── hobbies.js
│   │   ├── users.js
│   │   ├── payments.js
│   │   └── analytics.js
│   ├── utils/           # Utility functions
│   │   └── logger.js    # Winston logger
│   └── server.js        # Main server file
├── logs/                # Application logs
├── uploads/             # File uploads
├── package.json
├── env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Hobbies
- `GET /api/hobbies` - Get all hobbies with search/filtering
- `GET /api/hobbies/categories` - Get hobby categories
- `GET /api/hobbies/:id` - Get specific hobby
- `GET /api/hobbies/:id/related` - Get related hobbies
- `POST /api/hobbies/:id/save` - Save hobby for user
- `POST /api/hobbies/:id/complete` - Mark hobby as completed
- `POST /api/hobbies/:id/rate` - Rate a hobby
- `POST /api/hobbies/:id/review` - Add review to hobby

### Users
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/onboarding` - Get onboarding answers
- `POST /api/users/onboarding` - Save onboarding answers
- `GET /api/users/activity` - Get user activity
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/recommendations` - Get personalized recommendations

### Payments
- `POST /api/payments/subscriptions` - Create subscription
- `GET /api/payments/subscriptions` - Get user subscriptions
- `PUT /api/payments/subscriptions/:id` - Update subscription
- `DELETE /api/payments/subscriptions/:id` - Cancel subscription
- `GET /api/payments/payment-methods` - Get payment methods
- `GET /api/payments/invoices` - Get invoices

### Analytics (Admin Only)
- `GET /api/analytics/platform/users` - User growth analytics
- `GET /api/analytics/platform/hobbies` - Hobby popularity
- `GET /api/analytics/platform/engagement` - Engagement metrics
- `GET /api/analytics/platform/revenue` - Revenue metrics
- `GET /api/analytics/business/conversion` - Conversion rates
- `GET /api/analytics/business/retention` - Retention metrics
- `GET /api/analytics/business/churn` - Churn analysis

## 🔐 Security Features

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Data Sanitization**: Input sanitization and validation

## 📊 Monitoring & Logging

- **Structured Logging**: Winston logger with file and console output
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Request timing and performance metrics
- **Health Checks**: `/health` endpoint for monitoring

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "auth"
```

## 📈 Deployment

### Environment Variables
Ensure all required environment variables are set in production:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
# Local development (no Firebase)
# JWT_SECRET=dev-secret-change-me


# Firebase
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_PRIVATE_KEY=your-production-private-key
FIREBASE_CLIENT_EMAIL=your-production-client-email

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Logging
LOG_LEVEL=info
```

### Production Considerations
- Use PM2 or similar process manager
- Set up reverse proxy (Nginx)
- Configure SSL certificates
- Set up monitoring and alerting
- Implement backup strategies
- Configure CDN for static assets

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

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added payment processing and analytics
- **v1.2.0** - Enhanced security and performance optimizations

---

**Built with ❤️ for the HobiHobby business platform**


