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

function asQuizText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asQuizStringList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());
}

function asQuizNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatStarterCostAed(estimatedCostAED) {
  if (typeof estimatedCostAED !== 'number' || !Number.isFinite(estimatedCostAED) || estimatedCostAED < 0) {
    return 'AED starter';
  }
  return `AED ${Math.round(estimatedCostAED)} starter`;
}

function toQuizCatalogCandidate(docSnap) {
  const data = docSnap.data() || {};
  const name = asQuizText(data.name);
  if (!name) return null;
  return {
    hobbyId: docSnap.id,
    name,
    category: asQuizText(data.category),
    subcategory: asQuizText(data.subcategory),
    difficulty: asQuizText(data.difficulty),
    timePerWeek: asQuizText(data.timePerWeek),
    timeMinutes: asQuizNumber(data.timeMinutes),
    estimatedCostAED: asQuizNumber(data.estimatedCostAED),
    costRange: asQuizText(data.costRange),
    indoorOutdoor: asQuizText(data.indoorOutdoor),
    soloGroup: asQuizText(data.soloGroup),
    tags: asQuizStringList(data.tags),
    matchTags: asQuizStringList(data.matchTags),
    description: asQuizText(data.description),
  };
}

async function loadQuizCatalogCandidates() {
  let snap;
  try {
    snap = await db.collection('hobbies').get();
  } catch (error) {
    console.error('hobbyQuiz Firestore read failed:', error?.message || error);
    throw new HttpsError('internal', 'Failed to load hobby catalog');
  }

  const candidates = [];
  snap.forEach((docSnap) => {
    const candidate = toQuizCatalogCandidate(docSnap);
    if (candidate) candidates.push(candidate);
  });
  candidates.sort((a, b) => a.hobbyId.localeCompare(b.hobbyId));
  return candidates;
}

function buildHobbyQuizPrompt() {
  return [
    'You rank hobbies from the HobiHobby catalog for a user who just finished the discovery quiz.',
    'Return ONLY valid JSON with no markdown, using this shape:',
    '{',
    '  "selections": [',
    '    {',
    '      "hobbyId": "id from the supplied catalog",',
    '      "matchScore": 92,',
    '      "reasoning": "Why this catalog hobby fits the quiz answers."',
    '    }',
    '  ]',
    '}',
    'Rules:',
    '- Select at most 5 hobby IDs from the supplied catalog.',
    '- Select only hobby IDs that appear in the catalog.',
    '- Never create a hobby id.',
    '- Never invent a hobby.',
    '- Do not provide hobby name, difficulty, time, cost, category, or any other catalog fact.',
    '- matchScore is a number from 0 to 100.',
    '- reasoning explains the fit. Do not describe a different hobby.',
  ].join('\n');
}

function clampMatchScore(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(Math.min(100, Math.max(0, value)));
}

function readQuizSelections(raw, candidatesById) {
  const cleaned = String(raw).replace(/```json|```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON (hobbyQuiz):', raw);
    throw new HttpsError('internal', 'Failed to parse hobby recommendations');
  }

  const selections = parsed && Array.isArray(parsed.selections) ? parsed.selections : [];
  const seen = new Set();
  const chosen = [];
  const ignoredIds = [];

  for (const selection of selections) {
    const hobbyId = selection && typeof selection.hobbyId === 'string'
      ? selection.hobbyId.trim()
      : '';
    if (!hobbyId || !candidatesById.has(hobbyId)) {
      if (hobbyId) ignoredIds.push(hobbyId);
      continue;
    }
    if (seen.has(hobbyId)) continue;
    const matchScore = clampMatchScore(selection && selection.matchScore);
    if (matchScore === null) continue;
    seen.add(hobbyId);
    const reasoning = selection && typeof selection.reasoning === 'string' && selection.reasoning.trim()
      ? selection.reasoning.trim()
      : 'This catalog hobby fits your quiz answers.';
    chosen.push({ candidate: candidatesById.get(hobbyId), matchScore, reasoning });
  }

  if (ignoredIds.length > 0) {
    console.error('hobbyQuiz ignored unknown hobby ids:', ignoredIds);
  }

  chosen.sort((a, b) => (
    b.matchScore - a.matchScore || a.candidate.hobbyId.localeCompare(b.candidate.hobbyId)
  ));
  return chosen.slice(0, 5);
}

function toPublicQuizRecommendation(candidate, matchScore, reasoning) {
  return {
    hobbyId: candidate.hobbyId,
    hobby: candidate.name,
    matchScore,
    reasoning,
    timeCommitment: candidate.timePerWeek,
    estimatedCost: formatStarterCostAed(candidate.estimatedCostAED),
    difficulty: candidate.difficulty,
    category: candidate.category,
  };
}

function quizAnswersForPrompt(quizAnswers) {
  const safeAnswers = {};
  for (const [key, value] of Object.entries(quizAnswers)) {
    if (typeof value === 'string') safeAnswers[key] = value;
  }
  return safeAnswers;
}

// ─── AI: Hobby Quiz → Recommendations ────────────────────────────────────
exports.hobbyQuiz = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const quizAnswers = request.data?.quizAnswers;
    if (!quizAnswers || typeof quizAnswers !== 'object' || Array.isArray(quizAnswers)) {
      throw new HttpsError('invalid-argument', 'quizAnswers are required');
    }

    const candidates = await loadQuizCatalogCandidates();
    if (candidates.length === 0) {
      return { recommendations: [] };
    }

    const candidatesById = new Map(candidates.map((candidate) => [candidate.hobbyId, candidate]));
    const reply = await callGemini({
      systemText: buildHobbyQuizPrompt(),
      contents: [{
        role: 'user',
        parts: [{
          text: JSON.stringify({
            quizAnswers: quizAnswersForPrompt(quizAnswers),
            catalog: candidates,
          }),
        }],
      }],
      temperature: 0.4,
      maxOutputTokens: 1024,
      thinkingBudget: 0,
    });

    const chosen = readQuizSelections(reply, candidatesById);
    return {
      recommendations: chosen.map(({ candidate, matchScore, reasoning }) => (
        toPublicQuizRecommendation(candidate, matchScore, reasoning)
      )),
    };
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

const MOOD_RECOMMENDATION_MOODS = new Set([
  'stressed',
  'happy',
  'bored',
  'tired',
  'energetic',
  'sad',
  'anxious',
  'creative',
  'social',
  'focused',
]);

const MOOD_ENERGY_LEVELS = new Set(['low', 'medium', 'high']);
const MAX_MOOD_CANDIDATES = 20;
const MIN_USEFUL_MOOD_CANDIDATES = 3;

const CATEGORY_EMOJI = {
  'Art & Craft': '🎨',
  Fitness: '💪',
  Music: '🎵',
  Nature: '🌿',
  'Mind Games': '♟️',
};

const MOOD_EMOJI = {
  stressed: '😤',
  happy: '😊',
  bored: '😑',
  tired: '😴',
  energetic: '⚡',
  sad: '😢',
  anxious: '😰',
  creative: '🎨',
  social: '🤝',
  focused: '🎯',
};

function parseDurationMinutes(duration) {
  if (typeof duration !== 'string') return null;
  const match = duration.trim().match(/^(\d+)\s*(minutes|minute|mins|min)\b/i);
  if (!match) return null;
  const minutes = Number(match[1]);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
}

function timeFitRank(candidate) {
  if (candidate.fitsAvailableTime === true) return 0;
  if (candidate.fitsAvailableTime === null) return 1;
  return 2;
}

function compareMoodCandidates(a, b) {
  const byTime = timeFitRank(a) - timeFitRank(b);
  if (byTime !== 0) return byTime;
  return a.hobbyId < b.hobbyId ? -1 : a.hobbyId > b.hobbyId ? 1 : 0;
}

function usableReviewedTask(days, day) {
  const task = findReviewedJourneyTask(days, day);
  if (!task) return null;
  if (!task.title.trim() && !task.description.trim()) return null;
  return task;
}

function recommendationEmoji(hobbyEmoji, category, mood) {
  if (hobbyEmoji) return hobbyEmoji;
  if (category && CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
  return MOOD_EMOJI[mood] || '🎯';
}

function makeMoodCandidate({
  hobbyId,
  hobbyName,
  task,
  source,
  isFromJourney,
  journeyDay,
  availableTime,
  emoji,
  category,
}) {
  const durationMinutes = parseDurationMinutes(task.duration);
  return {
    candidateId: `${hobbyId}:${source}:${journeyDay}`,
    hobbyId,
    hobbyName,
    title: task.title.trim(),
    description: task.description.trim(),
    duration: task.duration.trim(),
    durationMinutes,
    type: task.type.trim(),
    tip: task.tip.trim(),
    isFromJourney,
    journeyDay: isFromJourney ? journeyDay : null,
    fitsAvailableTime: durationMinutes == null ? null : durationMinutes <= availableTime,
    emoji,
    category,
  };
}

function takeMoodCandidatePool(groups) {
  const pool = [];
  for (const group of groups) {
    const sorted = [...group].sort(compareMoodCandidates);
    for (const candidate of sorted) {
      if (pool.length >= MAX_MOOD_CANDIDATES) return pool;
      pool.push(candidate);
    }
  }
  return pool;
}

async function loadMoodCandidateRecords(uid) {
  let savedSnap;
  let journeysSnap;
  let templatesSnap;
  try {
    [savedSnap, journeysSnap, templatesSnap] = await Promise.all([
      db.collection('users').doc(uid).collection('savedHobbies').get(),
      db.collection('users').doc(uid).collection('journeys').get(),
      db.collection('journeyTemplates').get(),
    ]);
  } catch (error) {
    console.error('getMoodRecommendations Firestore read failed:', error?.message || error);
    throw new HttpsError('internal', 'Failed to load mood recommendations');
  }

  const templatesById = new Map();
  templatesSnap.forEach((docSnap) => {
    templatesById.set(docSnap.id, docSnap.data() || {});
  });

  const hobbyIds = new Set([
    ...savedSnap.docs.map((docSnap) => docSnap.id),
    ...journeysSnap.docs.map((docSnap) => docSnap.id),
    ...templatesById.keys(),
  ]);

  const hobbiesById = new Map();
  const hobbyRefs = [...hobbyIds]
    .filter((id) => typeof id === 'string' && id.trim())
    .map((id) => db.collection('hobbies').doc(id));
  if (hobbyRefs.length > 0) {
    try {
      const hobbySnaps = await db.getAll(...hobbyRefs);
      hobbySnaps.forEach((docSnap) => {
        hobbiesById.set(docSnap.id, docSnap.exists ? (docSnap.data() || {}) : null);
      });
    } catch (error) {
      console.error('getMoodRecommendations hobby catalog read failed:', error?.message || error);
      throw new HttpsError('internal', 'Failed to load mood recommendations');
    }
  }

  return {
    savedIds: savedSnap.docs.map((docSnap) => docSnap.id),
    journeys: journeysSnap.docs.map((docSnap) => ({
      hobbyId: docSnap.id,
      data: docSnap.data() || {},
    })),
    templatesById,
    hobbiesById,
  };
}

function canonicalMoodHobby(hobbyId, templatesById, hobbiesById) {
  const template = templatesById.get(hobbyId);
  const hobby = hobbiesById.get(hobbyId);
  const hasTemplate = Boolean(template);
  const hasCatalog = Boolean(hobby);
  if (!hasTemplate && !hasCatalog) return null;
  const hobbyName = firstNonEmptyString(hobby?.name, template?.hobbyName);
  if (!hobbyName || !hasTemplate) return null;
  return {
    hobbyId,
    hobbyName,
    template,
    emoji: typeof hobby?.emoji === 'string' ? hobby.emoji.trim() : '',
    category: typeof hobby?.category === 'string' ? hobby.category.trim() : '',
  };
}

function buildMoodCandidates({ records, availableTime }) {
  const { savedIds, journeys, templatesById, hobbiesById } = records;
  const usedHobbyIds = new Set();
  const journeyCandidates = [];
  const savedCandidates = [];

  const sortedJourneys = [...journeys].sort((a, b) => a.hobbyId.localeCompare(b.hobbyId));
  for (const journey of sortedJourneys) {
    const canonical = canonicalMoodHobby(journey.hobbyId, templatesById, hobbiesById);
    if (!canonical || usedHobbyIds.has(canonical.hobbyId)) continue;
    const currentDay = Number.isInteger(journey.data.currentDay) ? journey.data.currentDay : null;
    const task = usableReviewedTask(canonical.template.days, currentDay);
    if (!task) continue;
    usedHobbyIds.add(canonical.hobbyId);
    journeyCandidates.push(makeMoodCandidate({
      hobbyId: canonical.hobbyId,
      hobbyName: canonical.hobbyName,
      task,
      source: 'journey',
      isFromJourney: true,
      journeyDay: currentDay,
      availableTime,
      emoji: canonical.emoji,
      category: canonical.category,
    }));
  }

  for (const hobbyId of [...savedIds].sort()) {
    if (usedHobbyIds.has(hobbyId)) continue;
    const canonical = canonicalMoodHobby(hobbyId, templatesById, hobbiesById);
    if (!canonical) continue;
    const task = usableReviewedTask(canonical.template.days, 1);
    if (!task) continue;
    usedHobbyIds.add(canonical.hobbyId);
    savedCandidates.push(makeMoodCandidate({
      hobbyId: canonical.hobbyId,
      hobbyName: canonical.hobbyName,
      task,
      source: 'saved',
      isFromJourney: false,
      journeyDay: 1,
      availableTime,
      emoji: canonical.emoji,
      category: canonical.category,
    }));
  }

  const personal = [...journeyCandidates, ...savedCandidates];
  const usefulCount = personal.filter((candidate) => candidate.fitsAvailableTime !== false).length;
  const fallbackCandidates = [];
  if (usefulCount < MIN_USEFUL_MOOD_CANDIDATES) {
    const templateIds = [...templatesById.keys()].sort();
    for (const hobbyId of templateIds) {
      if (usedHobbyIds.has(hobbyId)) continue;
      const canonical = canonicalMoodHobby(hobbyId, templatesById, hobbiesById);
      if (!canonical) continue;
      const task = usableReviewedTask(canonical.template.days, 1);
      if (!task) continue;
      usedHobbyIds.add(canonical.hobbyId);
      fallbackCandidates.push(makeMoodCandidate({
        hobbyId: canonical.hobbyId,
        hobbyName: canonical.hobbyName,
        task,
        source: 'template',
        isFromJourney: false,
        journeyDay: 1,
        availableTime,
        emoji: canonical.emoji,
        category: canonical.category,
      }));
    }
  }

  return takeMoodCandidatePool([journeyCandidates, savedCandidates, fallbackCandidates]);
}

function moodCandidateForPrompt(candidate) {
  return {
    candidateId: candidate.candidateId,
    hobbyName: candidate.hobbyName,
    title: candidate.title,
    description: candidate.description,
    duration: candidate.duration,
    durationMinutes: candidate.durationMinutes,
    type: candidate.type,
    tip: candidate.tip,
    isFromJourney: candidate.isFromJourney,
    journeyDay: candidate.journeyDay,
    fitsAvailableTime: candidate.fitsAvailableTime,
  };
}

function buildMoodSelectionPrompt() {
  return [
    'You select reviewed HobiHobby activities for the user\'s current mood.',
    'Return ONLY valid JSON with no markdown, using this shape:',
    '{',
    '  "moodInsight": "A short useful sentence",',
    '  "selections": [',
    '    { "candidateId": "id from the supplied list", "reason": "Why this reviewed activity suits the mood" }',
    '  ]',
    '}',
    'Rules:',
    '- Select at most 3 candidate IDs from the supplied list.',
    '- Never create a candidate id.',
    '- Never rewrite or invent the activity.',
    '- Select only supplied candidate IDs.',
    '- Prefer active-journey candidates when they reasonably match the mood.',
    '- Prefer candidates with fitsAvailableTime true.',
    '- Candidates with fitsAvailableTime null may still be selected.',
    '- Do not assume a shorter version of a reviewed activity exists.',
    '- reason must explain the supplied activity. Do not describe a different activity.',
  ].join('\n');
}

function readMoodSelections(raw, candidatesById) {
  const cleaned = String(raw).replace(/```json|```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON (getMoodRecommendations):', raw);
    throw new HttpsError('internal', 'Failed to generate recommendations');
  }

  const moodInsight = parsed && typeof parsed.moodInsight === 'string' && parsed.moodInsight.trim()
    ? parsed.moodInsight.trim()
    : 'Here are reviewed activities that fit how you feel right now.';
  const selections = parsed && Array.isArray(parsed.selections) ? parsed.selections : [];
  const seen = new Set();
  const chosen = [];
  const ignoredIds = [];

  for (const selection of selections) {
    const candidateId = selection && typeof selection.candidateId === 'string'
      ? selection.candidateId.trim()
      : '';
    if (!candidateId || !candidatesById.has(candidateId)) {
      if (candidateId) ignoredIds.push(candidateId);
      continue;
    }
    if (seen.has(candidateId)) continue;
    seen.add(candidateId);
    const reason = selection && typeof selection.reason === 'string' && selection.reason.trim()
      ? selection.reason.trim()
      : 'This reviewed activity fits how you feel right now.';
    chosen.push({ candidate: candidatesById.get(candidateId), reason });
    if (chosen.length === 3) break;
  }

  if (ignoredIds.length > 0) {
    console.error('getMoodRecommendations ignored unknown candidate ids:', ignoredIds);
  }

  return { moodInsight, chosen };
}

function toPublicMoodRecommendation(candidate, reason, mood, intensity) {
  const recommendation = {
    hobbyId: candidate.hobbyId,
    hobbyName: candidate.hobbyName,
    activity: candidate.title || candidate.description,
    duration: candidate.duration,
    reason,
    isFromJourney: candidate.isFromJourney,
    energyLevel: intensity,
    emoji: recommendationEmoji(candidate.emoji, candidate.category, mood),
  };
  if (candidate.isFromJourney && Number.isInteger(candidate.journeyDay)) {
    recommendation.journeyDay = candidate.journeyDay;
  }
  return recommendation;
}

// ─── AI: Mood-based recommendations (Sprint 5) ────────────────────────────
exports.getMoodRecommendations = onCall(
  { secrets: ['GEMINI_API_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { mood, intensity, availableTime } = request.data ?? {};
    if (typeof mood !== 'string' || !MOOD_RECOMMENDATION_MOODS.has(mood)) {
      throw new HttpsError('invalid-argument', 'mood is required');
    }

    const resolvedIntensity = MOOD_ENERGY_LEVELS.has(intensity) ? intensity : 'medium';
    const resolvedTime = Number.isFinite(availableTime) && availableTime > 0
      ? availableTime
      : 30;

    const records = await loadMoodCandidateRecords(request.auth.uid);
    const candidates = buildMoodCandidates({ records, availableTime: resolvedTime });
    if (candidates.length === 0) {
      return {
        moodInsight: 'No reviewed activities are available yet. You can still explore hobbies and start a journey.',
        recommendations: [],
      };
    }

    const candidatesById = new Map(candidates.map((candidate) => [candidate.candidateId, candidate]));
    const reply = await callGemini({
      systemText: buildMoodSelectionPrompt(),
      contents: [{
        role: 'user',
        parts: [{
          text: JSON.stringify({
            mood,
            intensity: resolvedIntensity,
            availableTime: resolvedTime,
            candidates: candidates.map(moodCandidateForPrompt),
          }),
        }],
      }],
      temperature: 0.4,
      maxOutputTokens: 800,
      thinkingBudget: 0,
    });

    const { moodInsight, chosen } = readMoodSelections(reply, candidatesById);
    return {
      moodInsight,
      recommendations: chosen.map(({ candidate, reason }) => (
        toPublicMoodRecommendation(candidate, reason, mood, resolvedIntensity)
      )),
    };
  }
);