/**
 * generateJourneyDayImages.js
 *
 * Reads a reviewed journey image plan and generates only the days
 * flagged needsImage: true. Writes PNGs + metadata locally for
 * human review — never writes to Firestore or Firebase Storage.
 *
 * Usage:
 *   node scripts/generateJourneyDayImages.js pottery-ceramics
 *
 * Requires:
 *   - GEMINI_API_KEY in scripts/.env
 *   - scripts/journeyImagePlans/{hobbyId}.json (from planJourneyImages.js)
 *
 * Image model:
 *   Imagen 3 (`imagen-3.0-generate-002`) is already shut down.
 *   Imagen 4 (`imagen-4.0-generate-001`:predict) is deprecated and
 *   scheduled to shut down 17 Aug 2026. Use Gemini native image
 *   generation instead (`gemini-3.1-flash-image`:generateContent).
 *   Update IMAGE_MODEL if Google retires this id.
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');

const IMAGE_MODEL = 'gemini-3.1-flash-image';
const PLANS_DIR = path.join(__dirname, 'journeyImagePlans');
const OUTPUT_DIR = path.join(__dirname, 'journeyDayImages');
const RATE_LIMIT_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractInlineImage(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) {
      return {
        mimeType: inline.mimeType || inline.mime_type || 'image/png',
        data: inline.data,
      };
    }
  }

  return null;
}

async function generateImage(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Add it to scripts/.env (this is a local script, not Firebase secrets).'
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText;
    throw new Error(`Gemini API error: ${message}`);
  }

  const image = extractInlineImage(payload);
  if (!image) {
    const blockReason = payload?.promptFeedback?.blockReason
      || payload?.candidates?.[0]?.finishReason;
    throw new Error(
      blockReason
        ? `No image returned (${blockReason})`
        : 'No image data in Gemini response'
    );
  }

  return image;
}

async function generateDay({ hobbyId, dayEntry, destDir }) {
  if (!dayEntry.imageBrief || typeof dayEntry.imageBrief !== 'string') {
    throw new Error('missing imageBrief on flagged day');
  }

  const image = await generateImage(dayEntry.imageBrief);
  const pngPath = path.join(destDir, `day${dayEntry.day}.png`);
  const metaPath = path.join(destDir, `day${dayEntry.day}.json`);

  fs.writeFileSync(pngPath, Buffer.from(image.data, 'base64'));

  const metadata = {
    hobbyId,
    day: dayEntry.day,
    title: dayEntry.title,
    imageType: dayEntry.imageType ?? null,
    imageBrief: dayEntry.imageBrief,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(metaPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
}

async function main() {
  const hobbyId = process.argv[2]?.trim();
  if (!hobbyId) {
    console.error('Usage: node scripts/generateJourneyDayImages.js <hobbyId>');
    console.error('Example: node scripts/generateJourneyDayImages.js pottery-ceramics');
    process.exit(1);
  }

  const planPath = path.join(PLANS_DIR, `${hobbyId}.json`);
  if (!fs.existsSync(planPath)) {
    console.error(
      `Error: image plan not found: scripts/journeyImagePlans/${hobbyId}.json`
    );
    console.error(`Run first: node scripts/planJourneyImages.js ${hobbyId}`);
    process.exit(1);
  }

  const planFile = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const allDays = Array.isArray(planFile.plan) ? planFile.plan : [];
  const flagged = allDays.filter((day) => day.needsImage === true);
  const skipped = allDays.length - flagged.length;

  console.log(`Generating journey day images for "${hobbyId}"...`);
  console.log(`Using model: ${IMAGE_MODEL}`);
  console.log(
    `${flagged.length} to generate, ${skipped} skipped (needsImage: false)\n`
  );

  if (
    typeof planFile.daysNeedingImages === 'number'
    && planFile.daysNeedingImages !== flagged.length
  ) {
    console.warn(
      `⚠️  Plan daysNeedingImages is ${planFile.daysNeedingImages} but ${flagged.length} entries have needsImage: true — plan may have been hand-edited after generation (expected and fine).`
    );
  }

  if (flagged.length === 0) {
    console.log(
      `Done. 0 images generated, 0 failed, saved to scripts/journeyDayImages/${hobbyId}/ — review before running uploadJourneyDayImages.js`
    );
    return;
  }

  const destDir = path.join(OUTPUT_DIR, hobbyId);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < flagged.length; i += 1) {
    const dayEntry = flagged[i];
    try {
      await generateDay({ hobbyId, dayEntry, destDir });
      console.log(`✅ Day ${dayEntry.day} — image generated`);
      generated += 1;
    } catch (err) {
      const message = err.message || err;
      console.error(`❌ Day ${dayEntry.day} — generation failed: ${message}`);
      failed += 1;
    }

    if (i < flagged.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(
    `\nDone. ${generated} images generated, ${failed} failed, saved to scripts/journeyDayImages/${hobbyId}/ — review before running uploadJourneyDayImages.js`
  );
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
