---
name: local-dev-setup
description: Set up and run HobiHobby locally without Firebase credentials. Use when setting up local dev environment, debugging startup issues, running without Firebase, or troubleshooting the mock mode.
---

# Local Development Setup

## Quick Start

```bash
cd hobihobby
npm install
npm run web:install && npm run backend:install
cp backend/env.example backend/.env
npm run dev
```

This starts:
- **Web app**: http://localhost:3000 (Vite)
- **Backend API**: http://localhost:3001 (Express + nodemon)

## How Mock Mode Works

Without Firebase credentials, the app runs in **mock/local mode**:

### Backend (`backend/src/config/firebase.js`)
- `isFirebaseConfigured()` returns `false` when env vars contain placeholder values
- `initializeFirebase()` skips Firebase Admin SDK init and logs a warning
- All exports (`db`, `auth`, `getFirestore`, `getAuth`) return `null`

### Backend Controllers
- Check `isFirebaseConfigured()` before every Firestore call
- Return static mock data from `backend/src/data/` when Firebase is off
- Auth middleware sets a mock user: `{ uid: 'mock-user', email: 'mock@hobihobby.local' }`

### Frontend (`web/src/services/firebase.ts`)
- `isFirebaseConfigured` is `false` when `VITE_FIREBASE_*` env vars are missing
- Firebase SDK is not initialized
- `useAuth` skips `onAuthStateChanged` listener
- AI hooks (`useHobbyQuiz`, `useHobbyCoach`) show "not configured" errors

## Vite Proxy

`web/vite.config.ts` proxies `/api` requests to `http://localhost:3001` so the frontend can call the backend without CORS issues.

## Connecting Real Firebase

1. Create a Firebase project at console.firebase.google.com
2. Enable Authentication (Google provider)
3. Create a Firestore database
4. Download service account JSON from Project Settings → Service Accounts

### Backend `.env`
```
FIREBASE_PROJECT_ID=your-real-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Frontend `.env`
Create `web/.env`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Troubleshooting

### White screen on localhost:3000
Missing `VITE_FIREBASE_*` env vars cause Firebase SDK to crash silently. The fix: `isFirebaseConfigured` flag gates all Firebase calls.

### Backend crashes on startup
Placeholder `FIREBASE_PRIVATE_KEY` in `.env` causes `admin.credential.cert()` to throw. The fix: `initializeFirebase()` checks for placeholder values before initializing.

### Port conflicts
Web: 3000, Backend: 3001. Kill existing processes: `lsof -ti:3000,3001 | xargs kill -9`
