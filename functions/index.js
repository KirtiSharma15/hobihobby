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

function findReviewedJourneyTask(days, currentDay) {
  if (!Array.isArray(days) || !Number.isInteger(currentDay)) return null;
  const match = days.find((entry) => entry && Number(entry.day) === currentDay);
  if (!match || typeof match !== 'object') return null;
  const text = (value) => (typeof value === 'string' ? value : '');
  return {
    day: currentDay,
    title: text(match.title),
    description: text(match.description),
    duration: text(match.duration),
    type: text(match.type),
    tip: text(match.tip),
  };
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Authoritative coach context for one hobby.
 * Hobby identity comes only from server-controlled content:
 * hobbies/{hobbyId} or journeyTemplates/{hobbyId}.
 * A user journey may supply progress after that check, not the hobby name.
 * Returns null when neither canonical document exists.
 */
async function loadHobbyCoachContext(uid, hobbyId) {
  const journeyRef = db.collection('users').doc(uid).collection('journeys').doc(hobbyId);
  const templateRef = db.collection('journeyTemplates').doc(hobbyId);
  const hobbyRef = db.collection('hobbies').doc(hobbyId);

  let journeySnap;
  let templateSnap;
  let hobbySnap;
  try {
    [journeySnap, templateSnap, hobbySnap] = await Promise.all([
      journeyRef.get(),
      templateRef.get(),
      hobbyRef.get(),
    ]);
  } catch (error) {
    console.error('hobbyCoach Firestore read failed:', hobbyId, error?.message || error);
    throw new HttpsError('internal', 'Failed to load coach context');
  }

  const hasCanonicalHobby = templateSnap.exists || hobbySnap.exists;
  if (!hasCanonicalHobby) {
    return null;
  }

  const journey = journeySnap.exists ? (journeySnap.data() ?? {}) : null;
  const template = templateSnap.exists ? (templateSnap.data() ?? {}) : null;
  const hobby = hobbySnap.exists ? (hobbySnap.data() ?? {}) : null;

  const currentDay = journey && Number.isInteger(journey.currentDay) ? journey.currentDay : null;
  const learning = journey?.learningProgress;
  const completedLessonIds = Array.isArray(learning?.completedLessonIds)
    ? learning.completedLessonIds
    : [];

  return {
    hobbyId,
    hobbyName: firstNonEmptyString(hobby?.name, template?.hobbyName),
    currentDay,
    streak: journey ? (Number.isFinite(journey.streak) ? journey.streak : 0) : null,
    longestStreak: journey
      ? (Number.isFinite(journey.longestStreak) ? journey.longestStreak : 0)
      : null,
    completedDaysCount: journey
      ? (Array.isArray(journey.completedDays) ? journey.completedDays.length : 0)
      : null,
    currentJourneyTask: template ? findReviewedJourneyTask(template.days, currentDay) : null,
    learningProgress: learning && typeof learning === 'object'
      ? {
          currentLessonId: typeof learning.currentLessonId === 'string'
            ? learning.currentLessonId
            : null,
          completedLessonCount: completedLessonIds.length,
        }
      : null,
  };
}

function buildHobbyCoachSystemText(context) {
  if (!context) {
    return `You are an enthusiastic hobby coach on HobiHobby.
Help users discover and learn hobbies.
Ask them what hobby they want to explore if they haven't told you yet, then give specific advice.
Max 3 short paragraphs.`;
  }

  const hobbyLabel = context.hobbyName || 'this hobby';
  const lines = [
    `You are an expert hobby coach on HobiHobby specialising in ${hobbyLabel}.`,
    '',
    `The user is currently learning ${hobbyLabel}.`,
    'Never ask them what hobby they want to explore — you already know.',
    '',
  ];

  if (context.currentDay != null) {
    lines.push('Journey state:');
    lines.push(`- Current day: ${context.currentDay}`);
    lines.push(`- Streak: ${context.streak} days`);
    lines.push(`- Longest streak: ${context.longestStreak} days`);
    lines.push(`- Completed journey days: ${context.completedDaysCount}`);
    lines.push('');
  } else {
    lines.push('The user has no journey started for this hobby.');
    lines.push('Give general guidance for this hobby when they ask how to begin or what to practice.');
    lines.push('');
  }

  if (context.currentJourneyTask) {
    const task = context.currentJourneyTask;
    lines.push("Today's reviewed HobiHobby task:");
    lines.push(`Title: ${task.title}`);
    lines.push(`Description: ${task.description}`);
    lines.push(`Duration: ${task.duration}`);
    lines.push(`Type: ${task.type}`);
    lines.push(`Tip: ${task.tip}`);
    lines.push('');
    lines.push(
      'Use this task when the user asks about "today\'s task", "what should I do today", "this exercise", etc.'
    );
    lines.push('Do not replace it with an invented task.');
  } else {
    lines.push("No reviewed HobiHobby task is available for the user's current day.");
    lines.push('Do not invent a HobiHobby journey task.');
    lines.push('You may still give general hobby guidance if asked.');
  }

  if (context.learningProgress) {
    const lessonId = context.learningProgress.currentLessonId || 'none';
    lines.push('');
    lines.push('Learning progress:');
    lines.push(`- Current lesson id: ${lessonId}`);
    lines.push(`- Completed lesson count: ${context.learningProgress.completedLessonCount}`);
    lines.push('Do not infer a lesson title or lesson content from the lesson id.');
  }

  lines.push('');
  lines.push('Be encouraging, specific, and practical.');
  lines.push('Max 3 short paragraphs.');
  return lines.join('\n');
}

// ─── AI: Hobby Coach chat ─────────────────────────────────────────────────
exports.hobbyCoach = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { messages, hobbyId } = request.data ?? {};

    let coachContext = null;
    if (hobbyId !== undefined && hobbyId !== null) {
      if (typeof hobbyId !== 'string' || hobbyId.trim().length === 0) {
        throw new HttpsError('invalid-argument', 'hobbyId must be a non-empty string');
      }
      coachContext = await loadHobbyCoachContext(request.auth.uid, hobbyId.trim());
    }

    const contents = buildGeminiContents(messages);
    const reply = await callGemini({
      systemText: buildHobbyCoachSystemText(coachContext),
      contents,
      temperature: 0.8,
      maxOutputTokens: 1000,
    });

    return { reply };
  }
);

// ─── Retention: Journey day-boundary helpers ─────────────────────────────
function startOfUtcDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toDate(value) {
  if (!value) return null;
  return typeof value.toDate === 'function' ? value.toDate() : new Date(value);
}

// Computes the new streak based on how many calendar days have passed since
// the last completed activity: same day → unchanged, next day → +1, gap → reset to 1.
function calculateNewStreak(lastActivityAt, currentStreak) {
  const lastDate = toDate(lastActivityAt);
  if (!lastDate) return 1;

  const diffDays = Math.round((startOfUtcDay(new Date()) - startOfUtcDay(lastDate)) / 86400000);
  if (diffDays <= 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

function calculateMilestones({ existingMilestones, completedDaysCount, streak }) {
  const thresholds = [
    { condition: completedDaysCount === 1, id: 'first_day' },
    { condition: streak === 3, id: 'three_day_streak' },
    { condition: streak === 7, id: 'week_streak' },
    { condition: streak === 30, id: 'month_streak' },
    { condition: completedDaysCount === 10, id: 'ten_days' },
    { condition: completedDaysCount === 30, id: 'thirty_days' },
  ];

  const milestones = [...existingMilestones];
  const newlyEarned = [];

  for (const { condition, id } of thresholds) {
    if (condition && !milestones.includes(id)) {
      milestones.push(id);
      newlyEarned.push(id);
    }
  }

  return { milestones, newlyEarned };
}

// ─── Retention: Start a hobby journey ─────────────────────────────────────
exports.startJourney = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const { hobbyId } = request.data ?? {};
  if (!hobbyId) {
    throw new HttpsError('invalid-argument', 'hobbyId is required');
  }

  const journeyRef = db.collection('users').doc(uid).collection('journeys').doc(hobbyId);
  const journeySnap = await journeyRef.get();

  if (journeySnap.exists) {
    return { alreadyStarted: true, data: journeySnap.data() };
  }

  const templateSnap = await db.collection('journeyTemplates').doc(hobbyId).get();
  if (!templateSnap.exists) {
    throw new HttpsError('not-found', 'Journey template not found');
  }
  const template = templateSnap.data();

  const newJourney = {
    hobbyId,
    hobbyName: template.hobbyName,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    currentDay: 1,
    lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    streak: 0,
    longestStreak: 0,
    completedDays: [],
    milestones: [],
    totalDays: 365,
  };

  await journeyRef.set(newJourney);
  return { isNewJourney: true, data: newJourney };
});

// ─── Retention: Mark a journey day as complete ────────────────────────────
exports.completeDay = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const { hobbyId, day, photoURL } = request.data ?? {};
  if (!hobbyId || !Number.isInteger(day)) {
    throw new HttpsError('invalid-argument', 'hobbyId and day are required');
  }

  const journeyRef = db.collection('users').doc(uid).collection('journeys').doc(hobbyId);
  const journeySnap = await journeyRef.get();
  if (!journeySnap.exists) {
    throw new HttpsError('not-found', 'Journey not found');
  }
  const journey = journeySnap.data();

  const completedDays = journey.completedDays ?? [];
  if (completedDays.includes(day)) {
    return { alreadyCompleted: true };
  }

  const newStreak = calculateNewStreak(journey.lastActivityAt, journey.streak ?? 0);
  const newCompletedDays = [...completedDays, day];
  const { milestones: newMilestones, newlyEarned } = calculateMilestones({
    existingMilestones: journey.milestones ?? [],
    completedDaysCount: newCompletedDays.length,
    streak: newStreak,
  });

  await journeyRef.update({
    currentDay: day + 1,
    lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    streak: newStreak,
    longestStreak: Math.max(newStreak, journey.longestStreak ?? 0),
    completedDays: newCompletedDays,
    milestones: newMilestones,
  });

  if (photoURL) {
    await journeyRef.collection('photos').doc(String(day)).set({
      day,
      photoURL,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return {
    streak: newStreak,
    milestones: newMilestones,
    newMilestones: newlyEarned,
    nextDay: day + 1,
  };
});

// ─── Learning path: update lesson progress on journey doc ─────────────────
exports.updateLearningProgress = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const { hobbyId, lessonId, completed, setAsCurrent } = request.data ?? {};
  if (!hobbyId || !lessonId || typeof completed !== 'boolean') {
    throw new HttpsError('invalid-argument', 'hobbyId, lessonId, and completed are required');
  }

  const journeyRef = db.collection('users').doc(uid).collection('journeys').doc(hobbyId);
  const journeySnap = await journeyRef.get();

  const initialLearningProgress = {
    currentLessonId: null,
    completedLessonIds: [],
    lastActivityAt: null,
  };

  if (!journeySnap.exists) {
    // Learning progress can exist without a daily journey template.
    // currentLessonId starts null so a completion-only write can keep it null.
    await journeyRef.set({
      hobbyId,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      currentDay: 1,
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
      streak: 0,
      longestStreak: 0,
      completedDays: [],
      milestones: [],
      totalDays: 365,
      learningProgress: initialLearningProgress,
    });
  }

  const existing = journeySnap.exists
    ? (journeySnap.data() ?? {})
    : { learningProgress: initialLearningProgress };
  const prev = existing.learningProgress ?? initialLearningProgress;

  const completedLessonIds = [];
  const seenLessonIds = new Set();
  if (Array.isArray(prev.completedLessonIds)) {
    for (const id of prev.completedLessonIds) {
      if (!seenLessonIds.has(id)) {
        seenLessonIds.add(id);
        completedLessonIds.push(id);
      }
    }
  }

  if (completed) {
    if (!seenLessonIds.has(lessonId)) {
      completedLessonIds.push(lessonId);
    }
  } else {
    for (let i = completedLessonIds.length - 1; i >= 0; i -= 1) {
      if (completedLessonIds[i] === lessonId) {
        completedLessonIds.splice(i, 1);
      }
    }
  }

  const learningProgress = {
    currentLessonId: setAsCurrent === false ? (prev.currentLessonId ?? null) : lessonId,
    completedLessonIds,
    lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await journeyRef.set({ learningProgress }, { merge: true });

  return { success: true, learningProgress };
});

// ─── Learning path: read lesson progress from journey doc ─────────────────
exports.getLearningProgress = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const { hobbyId } = request.data ?? {};
  if (!hobbyId) {
    throw new HttpsError('invalid-argument', 'hobbyId is required');
  }

  const journeyRef = db.collection('users').doc(uid).collection('journeys').doc(hobbyId);
  const journeySnap = await journeyRef.get();

  if (!journeySnap.exists || !journeySnap.data()?.learningProgress) {
    return { learningProgress: null };
  }

  return { learningProgress: journeySnap.data().learningProgress };
});

// ─── AI: Weekly plan for a journey ────────────────────────────────────────
exports.getWeeklyPlan = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const uid = request.auth.uid;
    const { hobbyId, currentDay } = request.data ?? {};
    if (!hobbyId || !Number.isInteger(currentDay)) {
      throw new HttpsError('invalid-argument', 'hobbyId and currentDay are required');
    }

    const journeyRef = db.collection('users').doc(uid).collection('journeys').doc(hobbyId);
    const journeySnap = await journeyRef.get();
    if (!journeySnap.exists) {
      throw new HttpsError('not-found', 'Journey not found');
    }
    const journey = journeySnap.data();

    const templateSnap = await db.collection('journeyTemplates').doc(hobbyId).get();
    if (!templateSnap.exists) {
      throw new HttpsError('not-found', 'Journey template not found');
    }
    const template = templateSnap.data();

    const nextSevenDays = (template.days ?? []).filter(
      (d) => d.day >= currentDay && d.day < currentDay + 7
    );

    const prompt = `You are a personal hobby coach. Create an encouraging weekly plan for someone on day ${currentDay} of their ${journey.hobbyName} journey.

This week's scheduled tasks:
${JSON.stringify(nextSevenDays)}

Return ONLY valid JSON:
{
  "weekTheme": "Building core fundamentals",
  "encouragement": "You are making great progress...",
  "dailyTips": [
    { "day": 1, "tip": "Focus on..." }
  ],
  "weeklyGoal": "By end of this week you will..."
}`;

    const reply = await callGemini({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      temperature: 0.7,
      maxOutputTokens: 1500,
      thinkingBudget: 0,
    });

    const cleaned = reply.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON (getWeeklyPlan):', reply);
      throw new HttpsError('internal', 'Failed to parse weekly plan');
    }
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

// ─── Local Discovery: Nearby places search ───────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildPlacesSearchQuery(hobbyName, type) {
  switch (type) {
    case 'classes':
      return `${hobbyName} class OR workshop OR lesson`;
    case 'stores':
      return `${hobbyName} store OR supplies OR shop`;
    case 'events':
      return `${hobbyName} event OR meetup OR club`;
    case 'all':
    default:
      return `${hobbyName} class OR workshop OR store`;
  }
}

exports.findNearbyPlaces = onCall(
  { secrets: ['GOOGLE_MAPS_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { hobbyId, hobbyName, latitude, longitude, radius = 5000, type = 'all' } = request.data ?? {};

    if (!hobbyId || !hobbyName || typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new HttpsError('invalid-argument', 'hobbyId, hobbyName, latitude and longitude are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'GOOGLE_MAPS_API_KEY is not configured');
    }

    const query = buildPlacesSearchQuery(hobbyName, type);

    let searchResults;
    try {
      const searchResponse = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query,
            location: `${latitude},${longitude}`,
            radius,
            key: apiKey,
          },
        }
      );

      if (searchResponse.data.status !== 'OK' && searchResponse.data.status !== 'ZERO_RESULTS') {
        throw new HttpsError('internal', `Places search failed: ${searchResponse.data.status}`);
      }

      searchResults = searchResponse.data.results ?? [];
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      const message = error.response?.data?.error_message || error.message || 'Google Places request failed';
      console.error('Google Places API error (findNearbyPlaces search):', message);
      throw new HttpsError('internal', message);
    }

    // Rank by distance before hitting the Details API so we only spend
    // the (billed) Details call quota on the 10 places we'll actually return.
    const nearest = searchResults
      .filter((result) => result.geometry?.location)
      .map((result) => ({
        result,
        distance: getDistanceKm(
          latitude,
          longitude,
          result.geometry.location.lat,
          result.geometry.location.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    const places = await Promise.all(
      nearest.map(async ({ result, distance }) => {
        let details = {};
        try {
          const detailsResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
              params: {
                place_id: result.place_id,
                fields:
                  'name,formatted_address,geometry,rating,opening_hours,formatted_phone_number,website,price_level,photos,types',
                key: apiKey,
              },
            }
          );
          details = detailsResponse.data.result ?? {};
        } catch (error) {
          console.error(
            `Google Places API error (findNearbyPlaces details for ${result.place_id}):`,
            error.message
          );
        }

        const merged = { ...result, ...details };

        return {
          placeId: result.place_id,
          name: merged.name ?? '',
          address: merged.formatted_address ?? '',
          latitude: merged.geometry?.location?.lat ?? null,
          longitude: merged.geometry?.location?.lng ?? null,
          rating: merged.rating ?? null,
          totalRatings: merged.user_ratings_total ?? 0,
          isOpen: merged.opening_hours?.open_now ?? null,
          phone: merged.formatted_phone_number ?? '',
          website: merged.website ?? '',
          priceLevel: merged.price_level ?? null,
          types: merged.types ?? [],
          photoReference: merged.photos?.[0]?.photo_reference ?? null,
          distance: Math.round(distance * 100) / 100,
        };
      })
    );

    places.sort((a, b) => a.distance - b.distance);

    return { places };
  }
);

// ─── AI: Mood-based recommendations (Sprint 5) ────────────────────────────
exports.getMoodRecommendations = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const {
      mood,
      intensity = 'medium',
      availableTime = 30,
      savedHobbies,
      activeJourneys,
    } = request.data ?? {};

    if (!mood || typeof mood !== 'string') {
      throw new HttpsError('invalid-argument', 'mood is required');
    }

    const prompt = `You are a mood-based hobby recommendation 
engine for HobiHobby.

User's current mood: "${mood}" (intensity: ${intensity})
Available time right now: ${availableTime} minutes
Their saved hobbies: ${JSON.stringify(savedHobbies || [])}
Their active journeys: ${JSON.stringify(activeJourneys || [])}

Based on this mood and context, recommend 3 hobby activities 
they can do RIGHT NOW.

Rules:
- Prefer activities from their saved hobbies or active journeys
- Match the activity duration to their available time
- Match the energy level to their mood intensity
- If they have an active journey suggest the next task in it
- Be specific — not "do some painting" but 
  "spend 20 mins sketching simple shapes from your window"

Return ONLY valid JSON with no markdown:
{
  "moodInsight": "One sentence about why this mood calls for these activities",
  "recommendations": [
    {
      "hobbyName": "Watercolor Painting",
      "activity": "Specific activity to do right now",
      "duration": "20 mins",
      "reason": "Why this suits your current mood",
      "isFromJourney": true,
      "journeyDay": 5,
      "energyLevel": "low",
      "emoji": "🎨"
    }
  ]
}`;

    let response;
    try {
      response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }
      );
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message || 'Gemini API request failed';
      console.error('Gemini API error (getMoodRecommendations):', message, error.response?.data);
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
      console.error('Failed to parse Gemini response as JSON (getMoodRecommendations):', raw);
      throw new HttpsError('internal', 'Failed to generate recommendations');
    }
  }
);