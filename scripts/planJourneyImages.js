/**
 * planJourneyImages.js
 *
 * Asks Gemini which journey days would benefit from a reference image,
 * and drafts an image brief for each. Writes a local plan JSON for
 * human review — never generates images, never writes to Firestore.
 *
 * Usage:
 *   node scripts/planJourneyImages.js acrylic-painting
 *   node scripts/planJourneyImages.js pottery-ceramics
 *
 * Requires:
 *   - service-account.json at the repo root (hobby catalog context)
 *   - GEMINI_API_KEY in scripts/.env
 *   - scripts/journeyTemplates/{hobbyId}.json (reviewed template)
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Gemini 2.0 Flash was shut down June 2026 — use the active Flash model.
const GEMINI_MODEL = 'gemini-2.5-flash';
const TEMPLATES_DIR = path.join(__dirname, 'journeyTemplates');
const OUTPUT_DIR = path.join(__dirname, 'journeyImagePlans');
const RATE_LIMIT_MS = 300;
const VALID_IMAGE_TYPES = new Set([
  'technique-in-progress',
  'expected-outcome',
  'tool-reference',
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Strip optional markdown fences Gemini sometimes adds despite instructions. */
function extractJsonText(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) return fenced[1].trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function buildDayPrompt({ hobbyName, category, difficulty, day }) {
  return `You are planning visual content for a hobby-learning app called HobiHobby. The app teaches ${hobbyName} (category: ${category}, difficulty: ${difficulty}) through a structured day-by-day hobby journey of small daily tasks.

This app is designed to feel fun and approachable, NOT like a dense text-based course. Users should be able to glance at an image and understand what to do, rather than reading a paragraph.

Here is Day ${day.day}'s task:
Title: ${day.title}
Description: ${day.description}
Type: ${day.type}
Tip: ${day.tip}

Decide: does this specific day benefit from a single reference image that helps the user understand the physical action or expected outcome? Not every day needs one — reflection days, review days, or purely conceptual days (like planning or reading) usually don't. Days describing a clear physical technique, a visual outcome (like a color, shape, or texture result), or a specific hand position/tool usage usually DO.

Return ONLY valid JSON, no markdown:
{
  "needsImage": boolean,
  "imageType": "technique-in-progress" | "expected-outcome" | "tool-reference" | null,
  "imageBrief": "A detailed, specific prompt describing exactly what the image should show, written for an image generation model. Should specify: the action or object, a simple flat-illustration style (not photorealistic), warm earthy color palette (terracotta #C4522A, olive #6B7C3A, warm cream background #F5F0E8), minimal/clean composition, no text or labels in the image itself. Or null if needsImage is false.",
  "reasoning": "One sentence explaining the decision, for human review"
}`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Add it to scripts/.env (this is a local script, not Firebase secrets).'
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        // Gemini 2.5 thinks by default; disable so the JSON isn't truncated.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText;
    throw new Error(`Gemini API error: ${message}`);
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const blockReason = payload?.promptFeedback?.blockReason;
    throw new Error(
      blockReason ? `Response blocked: ${blockReason}` : 'No text response from Gemini'
    );
  }

  return text;
}

function normalizeDayPlan(parsed, sourceDay) {
  const needsImage = Boolean(parsed.needsImage);
  let imageType = parsed.imageType ?? null;
  let imageBrief = parsed.imageBrief ?? null;

  if (!needsImage) {
    imageType = null;
    imageBrief = null;
  } else if (imageType !== null && !VALID_IMAGE_TYPES.has(imageType)) {
    imageType = 'technique-in-progress';
  }

  return {
    day: sourceDay.day,
    title: sourceDay.title,
    needsImage,
    imageType,
    imageBrief,
    reasoning:
      typeof parsed.reasoning === 'string' && parsed.reasoning.trim()
        ? parsed.reasoning.trim()
        : needsImage
          ? 'Model flagged this day for an image.'
          : 'Model did not flag this day for an image.',
  };
}

async function planDay({ hobbyName, category, difficulty, day }) {
  const prompt = buildDayPrompt({ hobbyName, category, difficulty, day });
  const raw = await callGemini(prompt);
  const jsonText = extractJsonText(raw);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error(`Failed to parse Gemini response for day ${day.day}.`);
    console.error('Raw response:\n', raw);
    throw err;
  }

  return normalizeDayPlan(parsed, day);
}

async function main() {
  const hobbyId = process.argv[2]?.trim();
  if (!hobbyId) {
    console.error('Usage: node scripts/planJourneyImages.js <hobbyId>');
    console.error('Example: node scripts/planJourneyImages.js pottery-ceramics');
    process.exit(1);
  }

  const templatePath = path.join(TEMPLATES_DIR, `${hobbyId}.json`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: journey template not found: scripts/journeyTemplates/${hobbyId}.json`);
    process.exit(1);
  }

  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  const days = Array.isArray(template.days) ? template.days : [];
  if (days.length === 0) {
    console.error(`Error: template ${hobbyId}.json has no days array.`);
    process.exit(1);
  }

  const hobbySnap = await db.collection('hobbies').doc(hobbyId).get();
  if (!hobbySnap.exists) {
    console.error(`Error: hobbies/${hobbyId} not found in Firestore.`);
    process.exit(1);
  }

  const hobby = hobbySnap.data() || {};
  const hobbyName =
    typeof hobby.name === 'string' && hobby.name.trim()
      ? hobby.name.trim()
      : template.hobbyName || hobbyId;
  const category = typeof hobby.category === 'string' ? hobby.category : 'Hobby';
  const difficulty = typeof hobby.difficulty === 'string' ? hobby.difficulty : 'beginner';

  console.log(`Planning journey images for "${hobbyName}" (${hobbyId})...`);
  console.log(`Source template: scripts/journeyTemplates/${hobbyId}.json (${days.length} days)`);
  console.log(`Using model: ${GEMINI_MODEL}\n`);

  const plan = [];

  for (let i = 0; i < days.length; i += 1) {
    const day = days[i];
    const dayPlan = await planDay({ hobbyName, category, difficulty, day });
    plan.push(dayPlan);

    if (dayPlan.needsImage) {
      console.log(
        `Day ${dayPlan.day}: ${dayPlan.title} → needs image (${dayPlan.imageType})`
      );
    } else {
      console.log(`Day ${dayPlan.day}: ${dayPlan.title} → no image needed`);
    }

    if (i < days.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  const daysNeedingImages = plan.filter((d) => d.needsImage).length;
  const output = {
    hobbyId,
    hobbyName,
    generatedAt: new Date().toISOString(),
    totalDays: plan.length,
    daysNeedingImages,
    plan,
  };

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const relativeOut = `scripts/journeyImagePlans/${hobbyId}.json`;
  const outPath = path.join(OUTPUT_DIR, `${hobbyId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(
    `\nDone. ${daysNeedingImages} of ${plan.length} days flagged for images. Plan saved to ${relativeOut} — review before running generateJourneyDayImages.js`
  );
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
