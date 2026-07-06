---
name: ai-integration
description: Add new AI-powered features to HobiHobby using Firebase Cloud Functions and Google Gemini API. Use when adding AI features, creating new Cloud Functions, integrating Gemini, building quiz/coach/summarization features, or working with AI prompts.
---

# AI Integration Guide

## Architecture Overview

All AI calls follow this path:
```
Frontend hook → httpsCallable() → Cloud Function → Gemini REST API → response
```

The Gemini API key **never** touches the frontend. It lives only in Firebase Functions secrets.

## Adding a New AI Feature

### Step 1: Define the Cloud Function

In `functions/index.js`:

```js
const { onCall, HttpsError } = require('firebase-functions/v2/https');

exports.myNewFeature = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { inputData } = request.data;

    const systemText = `You are a [role]. [Instructions].`;
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    const reply = await callGemini({
      systemText,
      contents,
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    return { result: reply };
  }
);
```

### Step 2: Create the Frontend Hook

In `web/src/hooks/useMyFeature.ts`:

```ts
import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../services/firebase';

export const useMyFeature = () => {
  const callFeature = async (input: InputType) => {
    if (!isFirebaseConfigured || !functions) {
      throw new Error('Firebase not configured');
    }

    const fn = httpsCallable<RequestType, ResponseType>(functions, 'myNewFeature');
    const result = await fn({ inputData: input });
    return result.data;
  };

  return { callFeature };
};
```

### Step 3: Add Redux State (if needed)

In `web/src/store/slices/aiSlice.ts`, add new state fields and reducers for loading/error/data.

## Gemini Prompt Patterns

### Structured JSON Output
```
Return ONLY a valid JSON object with no markdown:
{
  "field": "value",
  "items": [{ "name": "", "score": 0 }]
}
```

### Conversational (Coach)
Use `buildGeminiContents()` for multi-turn. Set a `systemInstruction` for persona.

### Summarization
Use `gemini-2.5-flash-lite` for lighter tasks. Cap input with `.slice(0, 3000)`.

## Model Selection Guide

| Use Case | Model | Temperature |
|---|---|---|
| Structured JSON output | `gemini-2.5-flash` | 0.5–0.7 |
| Conversational/creative | `gemini-2.5-flash` | 0.7–0.9 |
| Summarization/extraction | `gemini-2.5-flash-lite` | 0.3–0.5 |

> Model IDs get retired on a rolling basis — verify against the [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) if calls start failing with a 404.

## Deploying

```bash
firebase deploy --only functions
```

Set secrets:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

## Local Testing

Without Firebase, AI features won't work. Options:
- Deploy Cloud Functions to Firebase and test against live
- Use the Firebase Emulator Suite: `firebase emulators:start --only functions`
- Add a local Express endpoint as a mock (see `local-dev-setup` skill)
