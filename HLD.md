# HobiHobby - High Level Design (HLD)

## 1. Executive Summary

HobiHobby is an AI-powered cross-platform hobby discovery and management application built with modern technologies. The application enables users to discover, save, track, and complete hobbies through multiple platforms (mobile, web) with a unified backend API.

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HobiHobby Ecosystem                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Mobile    │    │    Web      │    │   Shared    │        │
│  │   (Expo)    │    │  (React)    │    │ Components  │        │
│  │             │    │             │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │              │
│         └───────────────────┼───────────────────┘              │
│                             │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Backend API (Express.js)                │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   Auth      │  │   Hobbies   │  │  Payments   │    │   │
│  │  │ Controller  │  │ Controller  │  │ Controller  │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                External Services                        │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   Firebase  │  │   Stripe    │  │   Redis     │    │   │
│  │  │  (Auth &    │  │ (Payments)  │  │ (Caching)   │    │   │
│  │  │  Database)  │  │             │  │             │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Components

#### Frontend Applications
- **Mobile App (React Native + Expo)**: Cross-platform mobile application
- **Web App (React + Vite)**: Web-based application with responsive design
- **Shared Components**: Common UI components and business logic

#### Backend Services
- **API Server (Express.js)**: RESTful API with TypeScript support
- **Authentication Service**: Firebase Auth with JWT fallback
- **Payment Processing**: Stripe integration for subscriptions
- **Data Storage**: Firebase Firestore for primary database

#### External Integrations
- **Firebase**: Authentication, Firestore database, real-time features
- **Stripe**: Payment processing, subscription management
- **Redis**: Caching layer for improved performance

## 3. Technology Stack

### 3.1 Frontend Technologies

#### Mobile (React Native + Expo)
- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Components**: Custom component library
- **Platform Support**: iOS, Android, Web

#### Web (React + Vite)
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library

#### Shared Components
- **Package**: Monorepo with shared TypeScript package
- **State Management**: Redux slices for common functionality
- **Types**: Shared TypeScript interfaces
- **Utilities**: Common helper functions

### 3.2 Backend Technologies

#### API Server
- **Framework**: Express.js
- **Language**: JavaScript/Node.js
- **Authentication**: Firebase Admin SDK + JWT
- **Validation**: Express-validator + Joi
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **File Processing**: Multer + Sharp

#### Database & Storage
- **Primary Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Caching**: Redis (optional)

#### Payment Processing
- **Provider**: Stripe
- **Features**: Subscriptions, payment methods, invoices
- **Webhooks**: Stripe webhook handling

## 4. Data Architecture

### 4.1 Data Models

#### User Model
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  onboardingAnswers: OnboardingAnswers;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Hobby Model
```typescript
interface Hobby {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeRequired: string;
  cost: string;
  imageUrl: string;
  starterKit?: StarterKit;
  tutorials?: Tutorial[];
  rating: number;
  reviewCount: number;
  isSaved?: boolean;
  isCompleted?: boolean;
  materials?: string[];
  steps?: string[];
  progress?: number;
}
```

#### Subscription Model
```typescript
interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  priceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}
```

### 4.2 Database Structure (Firestore)

#### Collections
- **users**: User profiles and preferences
- **hobbies**: Hobby data and metadata
- **categories**: Hobby categories
- **subscriptions**: User subscription data
- **analytics**: Platform analytics and metrics

## 5. API Architecture

### 5.1 API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh-token` - Token refresh
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

#### Hobbies (`/api/hobbies`)
- `GET /` - Get hobbies with filtering/pagination
- `GET /:id` - Get specific hobby
- `GET /:id/related` - Get related hobbies
- `POST /:id/save` - Save hobby for user
- `DELETE /:id/save` - Unsave hobby
- `POST /:id/complete` - Mark hobby as completed
- `POST /:id/rate` - Rate hobby

#### Users (`/api/users`)
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update preferences
- `GET /recommendations` - Get personalized recommendations
- `GET /saved-hobbies` - Get saved hobbies
- `GET /completed-hobbies` - Get completed hobbies

#### Payments (`/api/payments`)
- `POST /subscriptions` - Create subscription
- `GET /subscriptions` - Get user subscriptions
- `PUT /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Cancel subscription
- `GET /payment-methods` - Get payment methods
- `POST /payment-methods` - Add payment method
- `DELETE /payment-methods/:id` - Remove payment method

#### Analytics (`/api/analytics`) - Admin Only
- `GET /platform/users` - User growth analytics
- `GET /platform/revenue` - Revenue metrics
- `GET /platform/hobbies` - Hobby engagement metrics

### 5.2 API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Backend   │    │  Firebase   │
│             │    │     API     │    │    Auth     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login Request  │                   │
       ├──────────────────►│                   │
       │                   │ 2. Verify Creds  │
       │                   ├──────────────────►│
       │                   │ 3. ID Token      │
       │                   │◄──────────────────┤
       │ 4. Access Token   │                   │
       │◄──────────────────┤                   │
       │                   │                   │
       │ 5. API Request +  │                   │
       │    Bearer Token   │                   │
       ├──────────────────►│                   │
       │                   │ 6. Verify Token  │
       │                   ├──────────────────►│
       │                   │ 7. User Data     │
       │                   │◄──────────────────┤
       │ 8. Response       │                   │
       │◄──────────────────┤                   │
```

### 6.2 Authorization Levels

#### Role-Based Access Control
- **User**: Standard user with hobby access
- **Admin**: Full platform access and analytics
- **Guest**: Limited access to public hobby data

#### Permission Matrix
| Resource | User | Admin | Guest |
|----------|------|-------|-------|
| View Hobbies | ✅ | ✅ | ✅ |
| Save Hobbies | ✅ | ✅ | ❌ |
| Complete Hobbies | ✅ | ✅ | ❌ |
| Rate Hobbies | ✅ | ✅ | ❌ |
| Manage Subscriptions | ✅ | ✅ | ❌ |
| View Analytics | ❌ | ✅ | ❌ |
| Manage Hobbies | ❌ | ✅ | ❌ |

### 6.3 Security Measures

#### Backend Security
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation and sanitization
- **JWT Tokens**: Secure token-based authentication
- **Firebase Security Rules**: Database-level security

#### Data Protection
- **Encryption**: Data encrypted in transit and at rest
- **PII Protection**: Personal information handling
- **GDPR Compliance**: Data privacy regulations
- **Secure Storage**: Firebase secure storage

## 7. Deployment Architecture

### 7.1 Development Environment

```
┌─────────────────────────────────────────────────────────┐
│                Development Setup                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Mobile    │  │    Web      │  │   Backend   │    │
│  │ Development │  │ Development │  │ Development │    │
│  │   Server    │  │   Server    │  │   Server    │    │
│  │ (Expo CLI)  │  │   (Vite)    │  │ (Nodemon)   │    │
│  │             │  │             │  │             │    │
│  │ :8081       │  │   :3000     │  │   :3001     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Production Deployment

#### Frontend Deployment
- **Mobile**: Expo Application Services (EAS) for app store distribution
- **Web**: Vercel/Netlify for web deployment
- **CDN**: Global content delivery for assets

#### Backend Deployment
- **Hosting**: Railway/Heroku/DigitalOcean
- **Container**: Docker containerization
- **Load Balancing**: Multiple instance deployment
- **Database**: Firebase managed services

#### Infrastructure Components
- **Domain**: Custom domain with SSL certificates
- **Monitoring**: Application performance monitoring
- **Logging**: Centralized logging system
- **Backups**: Automated database backups

## 8. Data Flow Architecture

### 8.1 User Registration Flow

```
1. User submits registration form
2. Frontend validates input
3. API call to /api/auth/register
4. Backend creates Firebase user
5. Backend creates user profile in Firestore
6. Backend returns success response
7. Frontend stores auth tokens
8. User redirected to onboarding
```

### 8.2 Hobby Discovery Flow

```
1. User opens app/website
2. Frontend requests hobbies from API
3. Backend queries Firestore for hobbies
4. Backend applies filters and pagination
5. Backend returns hobby data
6. Frontend renders hobby cards
7. User can save/complete hobbies
8. Frontend updates local state
```

### 8.3 Payment Processing Flow

```
1. User initiates subscription
2. Frontend collects payment method
3. API call to /api/payments/subscriptions
4. Backend creates Stripe customer
5. Backend creates Stripe subscription
6. Stripe processes payment
7. Webhook updates subscription status
8. Backend stores subscription data
9. Frontend shows subscription status
```

## 9. Performance Considerations

### 9.1 Frontend Optimization

#### Mobile App
- **Lazy Loading**: Components and images
- **Caching**: Redux Persist for offline support
- **Bundle Splitting**: Code splitting for faster loading
- **Image Optimization**: Compressed images and lazy loading

#### Web App
- **Vite Build**: Fast build times and HMR
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based code splitting
- **Service Workers**: Offline functionality

### 9.2 Backend Optimization

#### API Performance
- **Caching**: Redis caching for frequent queries
- **Pagination**: Efficient data pagination
- **Database Indexing**: Optimized Firestore queries
- **Response Compression**: Gzip compression

#### Scalability
- **Horizontal Scaling**: Multiple server instances
- **Database Sharding**: Distributed data storage
- **CDN**: Global content delivery
- **Load Balancing**: Traffic distribution

## 10. Monitoring and Analytics

### 10.1 Application Monitoring

#### Performance Metrics
- **Response Times**: API endpoint performance
- **Error Rates**: Application error tracking
- **User Engagement**: Feature usage analytics
- **Conversion Rates**: User journey metrics

#### Business Metrics
- **User Growth**: Registration and retention
- **Revenue Metrics**: Subscription analytics
- **Hobby Engagement**: Popular hobbies and completion rates
- **Platform Health**: System uptime and performance

### 10.2 Logging and Debugging

#### Backend Logging
- **Winston Logger**: Structured logging
- **Error Tracking**: Comprehensive error logging
- **Request Logging**: API request/response logging
- **Performance Logging**: Timing and metrics

#### Frontend Analytics
- **User Actions**: Button clicks and navigation
- **Performance**: Page load times and rendering
- **Errors**: Client-side error tracking
- **Usage Patterns**: Feature adoption analytics

## 11. Future Enhancements

### 11.1 Planned Features

#### AI Integration
- **Recommendation Engine**: AI-powered hobby suggestions
- **Personalization**: Machine learning for user preferences
- **Content Generation**: AI-assisted hobby content creation

#### Social Features
- **User Profiles**: Public hobby profiles
- **Social Sharing**: Share hobby progress
- **Community Features**: Hobby communities and forums
- **Achievements**: Gamification and badges

#### Advanced Analytics
- **Predictive Analytics**: User behavior prediction
- **Business Intelligence**: Advanced reporting dashboard
- **A/B Testing**: Feature experimentation framework

### 11.2 Technical Improvements

#### Architecture
- **Microservices**: Service decomposition
- **GraphQL**: Alternative API architecture
- **Real-time Features**: WebSocket integration
- **Offline Support**: Enhanced offline capabilities

#### Performance
- **Edge Computing**: CDN-based processing
- **Database Optimization**: Query optimization
- **Caching Strategy**: Advanced caching layers
- **Mobile Performance**: Native performance optimization

## 12. Conclusion

The HobiHobby application represents a modern, scalable cross-platform hobby discovery platform built with industry-standard technologies. The architecture supports both current requirements and future growth, with a focus on user experience, performance, and maintainability.

The modular design allows for independent development and deployment of frontend and backend components, while the shared components ensure consistency across platforms. The integration with Firebase and Stripe provides enterprise-grade authentication, database, and payment processing capabilities.

This HLD serves as the foundation for development, deployment, and future enhancements of the HobiHobby platform.



