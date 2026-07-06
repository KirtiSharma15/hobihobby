const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: 'us-central1' });

const GEMINI_MODEL = 'gemini-2.5-flash';

function buildGeminiContents(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpsError('invalid-argument', 'Messages are required');
  }

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(msg.content ?? '').trim() }],
  }));

  // Gemini requires alternating user/model turns — merge consecutive same-role messages
  const merged = [];
  for (const entry of contents) {
    const last = merged[merged.length - 1];
    if (last && last.role === entry.role) {
      last.parts[0].text += `\n\n${entry.parts[0].text}`;
    } else {
      merged.push({ role: entry.role, parts: [{ text: entry.parts[0].text }] });
    }
  }

  if (merged[0]?.role !== 'user') {
    throw new HttpsError('invalid-argument', 'Conversation must start with a user message');
  }

  return merged;
}

async function callGemini({ systemText, contents, maxOutputTokens = 1000, temperature = 0.8, thinkingBudget = 0 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError('failed-precondition', 'GEMINI_API_KEY is not configured');
  }

  const body = {
    contents,
    // Gemini 2.5 models "think" by default, and thinking tokens are drawn from the
    // same maxOutputTokens budget — without capping it, replies can get truncated
    // before any visible text is produced. Disable thinking unless the caller opts in.
    generationConfig: { temperature, maxOutputTokens, thinkingConfig: { thinkingBudget } },
  };

  if (systemText) {
    body.systemInstruction = { parts: [{ text: systemText }] };
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      body
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const blockReason = response.data?.promptFeedback?.blockReason;
      throw new HttpsError(
        'internal',
        blockReason ? `Response blocked: ${blockReason}` : 'No response from Gemini'
      );
    }

    return text;
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    const message = error.response?.data?.error?.message || error.message || 'Gemini API request failed';
    console.error('Gemini API error:', message, error.response?.data);
    throw new HttpsError('internal', message);
  }
}

// ─── Auth: sync user profile on first login ───────────────────────────────
exports.syncUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email ?? '';
  const { displayName, photoURL } = request.data;

  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const newUser = {
      uid,
      email,
      displayName: displayName ?? '',
      photoURL: photoURL ?? '',
      preferences: {
        indoorOutdoor: null,
        soloGroup: null,
        budgetRange: null,
        availableTime: null,
      },
      onboardingCompleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await userRef.set(newUser);
    return { isNewUser: true, data: newUser };
  }

  await userRef.update({
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { isNewUser: false, data: userSnap.data() };
});

// ─── AI: Hobby Quiz → Recommendations ────────────────────────────────────
exports.hobbyQuiz = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { quizAnswers } = request.data;

    const prompt = `You are a hobby recommendation engine for HobiHobby app.
Based on these quiz answers, return ONLY a valid JSON object with no markdown:
{
  "recommendations": [
    {
      "hobby": "Photography",
      "matchScore": 92,
      "reasoning": "Suits your love of outdoor exploration and visual creativity",
      "timeCommitment": "3-5 hrs/week",
      "estimatedCost": "$150 starter",
      "difficulty": "beginner",
      "category": "Creative"
    }
  ]
}

User quiz answers: ${JSON.stringify(quizAnswers)}
Return top 5 hobby recommendations ordered by matchScore descending.`;

    let response;
    try {
      response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            // Disable thinking: this is a straightforward structured-JSON task and
            // thinking tokens would otherwise eat into maxOutputTokens and truncate the JSON.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }
      );
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message || 'Gemini API request failed';
      console.error('Gemini API error (hobbyQuiz):', message, error.response?.data);
      throw new HttpsError('internal', message);
    }

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      throw new HttpsError('internal', 'No response from Gemini');
    }

    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON (hobbyQuiz):', raw);
      throw new HttpsError('internal', 'Failed to parse hobby recommendations');
    }
  }
);

// ─── AI: Hobby Coach chat ─────────────────────────────────────────────────
exports.hobbyCoach = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { messages, hobbyContext } = request.data ?? {};

    const systemText = hobbyContext
      ? `You are an enthusiastic hobby coach on HobiHobby helping a user learn ${hobbyContext}. Keep responses concise, friendly and actionable. Max 3 paragraphs.`
      : `You are an enthusiastic hobby coach on HobiHobby. Help users discover and learn hobbies. Never use placeholder text like [hobby] — always speak naturally and ask the user which hobby they are exploring if you don't know. Keep responses concise, friendly and actionable. Max 3 paragraphs.`;

    const contents = buildGeminiContents(messages);
    const reply = await callGemini({
      systemText,
      contents,
      temperature: 0.8,
      maxOutputTokens: 1000,
    });

    return { reply };
  }
);

// ─── AI: Tutorial Summarization ───────────────────────────────────────────
exports.summarizeTutorial = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { tutorialText, hobbyName } = request.data;

    const prompt = `Convert this ${hobbyName} tutorial into a beginner-friendly guide.
Return ONLY valid JSON with no markdown:
{
  "title": "",
  "timeEstimate": "30 mins",
  "steps": [
    { "step": 1, "title": "", "description": "", "tip": "" }
  ],
  "materialsNeeded": [],
  "difficultyLevel": "beginner"
}

Tutorial content: ${tutorialText.slice(0, 3000)}`;

    let response;
    try {
      response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }
      );
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message || 'Gemini API request failed';
      console.error('Gemini API error (summarizeTutorial):', message, error.response?.data);
      throw new HttpsError('internal', message);
    }

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      throw new HttpsError('internal', 'No response from Gemini');
    }

    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON (summarizeTutorial):', raw);
      throw new HttpsError('internal', 'Failed to parse tutorial summary');
    }
  }
);