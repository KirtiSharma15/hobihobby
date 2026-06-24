---
name: coding-standards
description: HobiHobby project coding standards and conventions. Use when writing new components, hooks, controllers, Cloud Functions, Redux slices, or reviewing code for consistency. Covers TypeScript, React, TailwindCSS, Redux Toolkit, Express, and Firebase Cloud Functions patterns.
---

# HobiHobby Coding Standards

## Quick Reference

### New React Component
```tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface MyComponentProps {
  title: string;
  variant?: 'default' | 'accent';
  className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, variant = 'default', className }) => {
  return (
    <div className={cn('p-4 rounded-lg', variant === 'accent' && 'bg-accent-50', className)}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
  );
};
```

### New Custom Hook
```tsx
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';

export interface UseMyFeatureReturn {
  data: string[];
  isLoading: boolean;
  doAction: (id: string) => Promise<void>;
}

export const useMyFeature = (): UseMyFeatureReturn => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const doAction = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // ... logic
    } catch (error) {
      dispatch(setError('Action failed'));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  return { data: [], isLoading, doAction };
};
```

### New Redux Slice
```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MyFeatureState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MyFeatureState = { items: [], isLoading: false, error: null };

const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Item[]>) => { state.items = action.payload; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; state.isLoading = false; },
    clear: () => initialState,
  },
});

export const { setItems, setLoading, setError, clear } = myFeatureSlice.actions;
export const myFeatureReducer = myFeatureSlice.reducer;
export default myFeatureReducer;
```

### New Backend Controller
```js
const { getFirestore, isFirebaseConfigured } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const asyncHandler = require('express-async-handler');

const getItems = asyncHandler(async (req, res) => {
  if (!isFirebaseConfigured()) {
    return res.json({ success: true, data: MOCK_DATA });
  }
  const db = getFirestore();
  const snapshot = await db.collection('items').get();
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return res.json({ success: true, data: items });
});

module.exports = { getItems };
```

### New Cloud Function
```js
const { onCall, HttpsError } = require('firebase-functions/v2/https');

exports.myFunction = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in');
    const { input } = request.data;
    const reply = await callGemini({ systemText: '...', contents: [{ role: 'user', parts: [{ text: input }] }] });
    return { result: reply };
  }
);
```

## Detailed Rules

For file-specific conventions, see these rules in `.cursor/rules/`:
- `typescript-react-standards.mdc` — component/hook/type patterns
- `tailwind-styling.mdc` — design tokens, cn(), UI primitives
- `redux-patterns.mdc` — slice structure, async thunks, typed hooks
- `backend-js-standards.mdc` — controller/route/error patterns, Cloud Functions
- `cloud-functions.mdc` — Gemini integration, v2 SDK, secrets

## Known Inconsistencies (Accept, Don't Fix Unless Touched)
- Some pages use default exports (QuizPage, CoachPage); most use named — prefer named for new files
- Some hooks use `export const` arrow, some use `export function` — prefer `export const` arrow
- HomePage/ExplorePage have inline HobbyCard components duplicating `components/HobbyCard.tsx`
- Two saved-hobbies systems: localStorage hooks vs Redux/API — both are valid for their context
- `@/` path alias vs `../` relative imports mixed — prefer `@/` for cross-directory
