/**
 * generateJourneyDraft.js
 *
 * Generates a draft 7-day journey template JSON for a hobby via Gemini.
 * Writes to disk for human review — never writes to Firestore.
 *
 * Usage:
 *   node scripts/generateJourneyDraft.js <hobbyId>
 *   node scripts/generateJourneyDraft.js yoga
 *
 * Requires GEMINI_API_KEY in a local .env at the repo root.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');

// Gemini 2.0 Flash was shut down June 2026 — use the active Flash model.
const GEMINI_MODEL = 'gemini-2.5-flash';
const EXAMPLE_TEMPLATE_PATH = path.join(
  __dirname,
  'journeyTemplates',
  'pottery-ceramics.json'
);
const HOBBIES_DIR = path.join(__dirname, 'hobbies');
const OUTPUT_DIR = path.join(__dirname, 'journeyTemplates');
const DAY_REQUIRED_FIELDS = ['day', 'title', 'description', 'duration', 'type', 'tip'];
const EXPECTED_DAY_COUNT = 7;

/**
 * Fallback catalog fields from scripts/seedHobbies.js
 * (used until hobbies are externalized to scripts/hobbies/*.json).
 */
const HOBBY_CATALOG = {
  'watercolor-painting': {
    name: 'Watercolor Painting',
    difficulty: 'beginner',
    description:
      'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color and delicate brushwork.',
    starterKit: [
      'Watercolor paint set',
      'Watercolor paper pad',
      'Round brushes set',
      'Water containers',
      'Paper towels',
      'Palette',
    ],
  },
  photography: {
    name: 'Photography',
    difficulty: 'beginner',
    description:
      'Discover the art of capturing moments. From smartphone photography to DSLR, learn composition, lighting, and editing to tell visual stories.',
    starterKit: [
      'Camera or smartphone',
      'Memory card',
      'Camera bag',
      'Editing app (Lightroom Mobile)',
      'Tripod (optional)',
    ],
  },
  'pottery-ceramics': {
    name: 'Pottery & Ceramics',
    difficulty: 'beginner',
    description:
      'A calming, hands-on craft where you shape clay into bowls, mugs, and vases. Beginner-friendly and deeply meditative.',
    starterKit: [
      'Air-dry clay',
      'Pottery tools set',
      'Turntable',
      'Sponge',
      'Canvas work mat',
      'Glaze set',
    ],
  },
  calligraphy: {
    name: 'Calligraphy',
    difficulty: 'beginner',
    description:
      'The art of beautiful writing. Learn brush calligraphy to create stunning lettered pieces for cards, gifts, and home décor.',
    starterKit: [
      'Brush pen set (Tombow)',
      'Calligraphy paper pad',
      'Practice sheets',
      'Fine liner pens',
    ],
  },
  'sketching-drawing': {
    name: 'Sketching & Drawing',
    difficulty: 'beginner',
    description:
      'The most accessible art form. Sketch anywhere with just a pencil and paper. Learn observation, proportion, and shading to draw anything you see.',
    starterKit: [
      'Sketchbook (A5 or A4)',
      'Pencil set (HB, 2B, 4B, 6B)',
      'Kneaded eraser',
      'Blending stumps',
      'Fine liner set',
    ],
  },
  'acrylic-painting': {
    name: 'Acrylic Painting',
    difficulty: 'beginner',
    description:
      'Fast-drying, forgiving, and vibrant. Acrylic painting is perfect for beginners who want bold results without the complexity of oils.',
    starterKit: [
      'Acrylic paint set (12 colours)',
      'Canvas boards (pack of 5)',
      'Brush set',
      'Palette',
      'Easel (optional)',
    ],
  },
  running: {
    name: 'Running',
    difficulty: 'beginner',
    description:
      'The simplest and most effective way to get fit. Start with a 5K plan and build to longer distances at your own pace.',
    starterKit: [
      'Running shoes',
      'Moisture-wicking socks',
      'Running shorts/leggings',
      'Running app (Nike Run Club)',
      'Water bottle',
    ],
  },
  yoga: {
    name: 'Yoga',
    difficulty: 'beginner',
    description:
      'A practice that unites body, mind, and breath. Whether you want flexibility, strength, or stress relief, yoga adapts to every level.',
    starterKit: [
      'Yoga mat',
      'Yoga blocks (2)',
      'Yoga strap',
      'Comfortable clothes',
      'YouTube channel (Yoga with Adriene)',
    ],
  },
  cycling: {
    name: 'Cycling',
    difficulty: 'beginner',
    description:
      'Explore the UAE on two wheels. Cycling is low-impact, social, and lets you cover ground you could never reach on foot.',
    starterKit: [
      'Bicycle (entry-level road or hybrid)',
      'Helmet (essential)',
      'Cycling gloves',
      'Water bottle cage',
      'Basic repair kit',
    ],
  },
  swimming: {
    name: 'Swimming',
    difficulty: 'beginner',
    description:
      'A low-impact, full-body workout that is gentle on joints. Perfect for all fitness levels and ideal for the UAE climate.',
    starterKit: ['Swimsuit/trunks', 'Goggles', 'Swim cap', 'Kickboard', 'Pull buoy'],
  },
  'rock-climbing': {
    name: 'Rock Climbing',
    difficulty: 'beginner',
    description:
      'A full-body workout that is also a puzzle. Indoor climbing walls make it accessible for beginners in Dubai and Abu Dhabi.',
    starterKit: [
      'Climbing shoes (rent first)',
      'Chalk bag',
      'Harness (rent first)',
      'Day pass to climbing gym',
    ],
  },
  guitar: {
    name: 'Guitar',
    difficulty: 'beginner',
    description:
      "Learn to play guitar and unlock a lifetime of music. Start with chords, progress to songs, and discover why guitar is the world's most popular instrument.",
    starterKit: [
      'Acoustic guitar (entry-level)',
      'Guitar picks (variety pack)',
      'Tuner clip',
      'Extra strings (pack)',
      'Guitar app (Yousician or Justin Guitar)',
    ],
  },
  piano: {
    name: 'Piano',
    difficulty: 'beginner',
    description:
      'The piano teaches you to read music, develop rhythm, and understand harmony. A rewarding long-term hobby with apps making it more accessible than ever.',
    starterKit: [
      'Digital keyboard (61 keys minimum)',
      'Sustain pedal',
      'Piano bench or stool',
      'Headphones (for practice)',
      'App: Simply Piano or Flowkey',
    ],
  },
  singing: {
    name: 'Singing',
    difficulty: 'beginner',
    description:
      'Everyone can learn to sing better. Vocal training improves pitch, range, and confidence. One of the most expressive and accessible hobbies.',
    starterKit: [
      'Vocal warm-up app (Vanido)',
      'Bluetooth speaker',
      'Microphone (optional)',
      'Online vocal coach (YouTube)',
    ],
  },
  gardening: {
    name: 'Gardening',
    difficulty: 'beginner',
    description:
      "Grow your own herbs, flowers, or vegetables. Gardening reduces stress, connects you to nature, and is especially rewarding in the UAE's climate.",
    starterKit: [
      'Plant pots (variety of sizes)',
      'Potting soil',
      'Basic tool set (trowel, fork)',
      'Starter seeds or seedlings',
      'Watering can',
    ],
  },
  hiking: {
    name: 'Hiking',
    difficulty: 'beginner',
    description:
      'The UAE has stunning hiking trails from Jebel Hafeet to Wadi Ghul. Hiking combines fitness, nature, and exploration in one rewarding activity.',
    starterKit: [
      'Hiking boots or trail shoes',
      'Hydration pack (2L)',
      'Sun protection (hat, SPF)',
      'Trekking poles (optional)',
      'Trail app (AllTrails)',
    ],
  },
  birdwatching: {
    name: 'Birdwatching',
    difficulty: 'beginner',
    description:
      "The UAE is on a major migratory flyway making it a birdwatcher's paradise. A meditative hobby that deepens your connection to the natural world.",
    starterKit: [
      'Binoculars (8x42 recommended)',
      'Field guide (Birds of the Middle East)',
      'Notebook and pen',
      'App: eBird or Merlin',
      'Comfortable walking shoes',
    ],
  },
  chess: {
    name: 'Chess',
    difficulty: 'beginner',
    description:
      "The world's greatest strategy game. Chess sharpens critical thinking, patience, and pattern recognition. Play online or find a local club.",
    starterKit: [
      'Chess set (board + pieces)',
      'App: Chess.com or Lichess (free)',
      'Chess clock (for competitive play)',
      'Beginner book: Bobby Fischer Teaches Chess',
    ],
  },
  reading: {
    name: 'Reading',
    difficulty: 'beginner',
    description:
      'Reading builds empathy, vocabulary, and knowledge. Whether fiction or non-fiction, reading is the most accessible and rewarding lifelong hobby.',
    starterKit: [
      'Kindle or e-reader (optional)',
      'Goodreads account (free)',
      'Library card (free)',
      'Bookmark',
      'Reading lamp',
    ],
  },
  meditation: {
    name: 'Meditation',
    difficulty: 'beginner',
    description:
      'A daily meditation practice reduces stress, improves focus, and builds emotional resilience. Just 10 minutes a day can transform your mental wellbeing.',
    starterKit: [
      'App: Headspace or Calm (free trial)',
      'Meditation cushion or pillow',
      'Timer',
      'Quiet space',
      'Journal (optional)',
    ],
  },
};

/**
 * @param {string} hobbyId
 * @returns {{ name: string, difficulty: string, description: string, starterKit: string[] }}
 */
function lookupHobby(hobbyId) {
  const filePath = path.join(HOBBIES_DIR, `${hobbyId}.json`);
  if (fs.existsSync(filePath)) {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const name = raw.name ?? raw.data?.name;
    const difficulty = raw.difficulty ?? raw.data?.difficulty;
    const description = raw.description ?? raw.data?.description;
    const starterKit = raw.starterKit ?? raw.data?.starterKit;

    if (!name || !difficulty || !description || !Array.isArray(starterKit)) {
      throw new Error(
        `scripts/hobbies/${hobbyId}.json is missing name, difficulty, description, or starterKit`
      );
    }

    return { name, difficulty, description, starterKit };
  }

  const fallback = HOBBY_CATALOG[hobbyId];
  if (!fallback) {
    throw new Error(
      `Unknown hobbyId "${hobbyId}". Add scripts/hobbies/${hobbyId}.json or update HOBBY_CATALOG.`
    );
  }

  return fallback;
}

/**
 * @param {unknown} data
 * @param {string} hobbyId
 * @returns {{ ok: true, data: object } | { ok: false, reason: string }}
 */
function validateTemplate(data, hobbyId) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'root value must be a JSON object' };
  }

  const template = /** @type {Record<string, unknown>} */ (data);

  if (typeof template.hobbyId !== 'string' || !template.hobbyId.trim()) {
    return { ok: false, reason: 'missing or invalid hobbyId' };
  }
  if (template.hobbyId !== hobbyId) {
    return {
      ok: false,
      reason: `hobbyId "${template.hobbyId}" does not match requested "${hobbyId}"`,
    };
  }
  if (typeof template.hobbyName !== 'string' || !template.hobbyName.trim()) {
    return { ok: false, reason: 'missing or invalid hobbyName' };
  }
  if (typeof template.totalDays !== 'number' || !Number.isFinite(template.totalDays)) {
    return { ok: false, reason: 'missing or invalid totalDays' };
  }
  if (!Array.isArray(template.days)) {
    return { ok: false, reason: 'days must be an array' };
  }
  if (template.days.length !== EXPECTED_DAY_COUNT) {
    return {
      ok: false,
      reason: `days must contain exactly ${EXPECTED_DAY_COUNT} entries (got ${template.days.length})`,
    };
  }

  for (let i = 0; i < template.days.length; i++) {
    const dayEntry = template.days[i];
    if (!dayEntry || typeof dayEntry !== 'object' || Array.isArray(dayEntry)) {
      return { ok: false, reason: `days[${i}] must be an object` };
    }
    for (const field of DAY_REQUIRED_FIELDS) {
      if (dayEntry[field] === undefined || dayEntry[field] === null || dayEntry[field] === '') {
        return { ok: false, reason: `days[${i}] missing required field "${field}"` };
      }
    }
  }

  return {
    ok: true,
    data: {
      hobbyId: template.hobbyId,
      hobbyName: template.hobbyName,
      totalDays: template.totalDays,
      days: template.days,
    },
  };
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

function buildPrompt({ hobbyId, hobby, exampleTemplate }) {
  return `You write beginner 7-day hobby journey templates for HobiHobby.

EXAMPLE TEMPLATE (formatting + tone reference — do not copy content):
${JSON.stringify(exampleTemplate, null, 2)}

TARGET HOBBY:
- hobbyId: ${hobbyId}
- hobbyName: ${hobby.name}
- difficulty: ${hobby.difficulty}
- description: ${hobby.description}
- starterKit: ${JSON.stringify(hobby.starterKit)}

TASK:
Return a single JSON object with this exact schema:
{
  "hobbyId": "${hobbyId}",
  "hobbyName": "${hobby.name}",
  "totalDays": 365,
  "days": [
    { "day": 1, "title": "...", "description": "...", "duration": "...", "type": "...", "tip": "..." }
  ]
}

RULES:
- Exactly 7 day objects in "days", numbered day 1 through day 7.
- Each day must include: day, title, description, duration, type, tip.
- Day 1 must be a zero-equipment-needed first action (bodyweight, observation, or household items only).
- Days must progress in difficulty from day 1 to day 7.
- Descriptions must be specific and actionable, not generic. Prefer "try X technique for N minutes" over "learn the basics".
- Tips must be a single practical insight, not encouragement or motivation.
- duration should look like "15 min", "20 min", "30 min", etc.
- type should be a short label like the example (practice, watch + try, reflect, experiment, project, etc.).
- Day 7 should be a week-1 review / reflect style day, matching the example pattern.
- Return raw JSON only. No markdown fences. No commentary.`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Add it to a .env file at the repo root (this is a local script, not Firebase secrets).'
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
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

async function main() {
  const hobbyId = process.argv[2]?.trim();
  if (!hobbyId) {
    console.error('Usage: node scripts/generateJourneyDraft.js <hobbyId>');
    console.error('Example: node scripts/generateJourneyDraft.js yoga');
    process.exit(1);
  }

  if (!fs.existsSync(EXAMPLE_TEMPLATE_PATH)) {
    throw new Error(`Example template not found: ${EXAMPLE_TEMPLATE_PATH}`);
  }

  const hobby = lookupHobby(hobbyId);
  const exampleTemplate = JSON.parse(fs.readFileSync(EXAMPLE_TEMPLATE_PATH, 'utf8'));

  console.log(`Generating draft journey for "${hobby.name}" (${hobbyId})...`);
  console.log(`Using model: ${GEMINI_MODEL}`);

  const prompt = buildPrompt({ hobbyId, hobby, exampleTemplate });
  const rawResponse = await callGemini(prompt);
  const jsonText = extractJsonText(rawResponse);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON.');
    console.error('Raw response:\n', rawResponse);
    throw err;
  }

  // Ensure identity fields match the request even if the model drifts slightly.
  parsed.hobbyId = hobbyId;
  parsed.hobbyName = hobby.name;
  if (typeof parsed.totalDays !== 'number') {
    parsed.totalDays = 365;
  }

  const validation = validateTemplate(parsed, hobbyId);
  if (!validation.ok) {
    console.error('Generated draft failed schema validation:', validation.reason);
    console.error('Parsed object:\n', JSON.stringify(parsed, null, 2));
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const relativeOut = path.join('scripts', 'journeyTemplates', `${hobbyId}.json`);
  const outPath = path.join(OUTPUT_DIR, `${hobbyId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(validation.data, null, 2)}\n`, 'utf8');

  console.log(`Draft written to ${relativeOut.replace(/\\/g, '/')} — review before running seedJourneys.js`);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
