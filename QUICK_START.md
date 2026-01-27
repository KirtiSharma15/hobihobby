# Quick Start Guide - HobiHobby

## Running the Application

### Option 1: Run Micro Frontends (Full Architecture)

Run all micro frontends together:
```bash
npm run dev:micro
```

This will start:
- **Root Config** (orchestrator): http://localhost:9000
- **Hobbies** micro frontend: http://localhost:3001
- **Auth** micro frontend: http://localhost:3002  
- **Profile** micro frontend: http://localhost:3003
- **Backend API**: http://localhost:3001

**Access the app at: http://localhost:9000**

### Option 2: Run Simple Web App (Traditional)

Run just the web app and backend:
```bash
npm run dev
```

This will start:
- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:3001 (or as configured)

**Access the app at: http://localhost:3000**

## Important Notes

### For Micro Frontends:
1. Make sure all micro frontends are running
2. The root config (port 9000) loads and orchestrates the others
3. Each micro frontend needs to be running for the full experience

### For Simple Web App:
- This is the traditional monolithic frontend approach
- All features in one application
- Easier to debug and develop

## Troubleshooting

### Port Already in Use
If you get port conflicts:
- Stop other applications using those ports
- Or update ports in the respective `vite.config.ts` files

### CORS Issues
- Ensure backend CORS is configured to allow frontend origins
- Check `backend/src/server.js` for CORS settings

### Module Not Found Errors
- Run `npm install` in each directory
- Or run `npm run install:all` from root

## Development Tips

1. **Micro Frontends**: Edit code in respective directories:
   - `micro-frontends/hobbies/` - Hobbies features
   - `micro-frontends/auth/` - Authentication
   - `micro-frontends/profile/` - User profile

2. **Shared Code**: Edit in `shared/` for cross-app code

3. **Backend**: API code in `backend/src/`

## Next Steps

1. Set up environment variables in `backend/.env` (copy from `backend/env.example`)
2. Configure Firebase credentials if using Firebase Auth
3. Start developing!



