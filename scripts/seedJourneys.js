const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/** Hobby IDs from scripts/seedHobbies.js — used to warn on unknown template filenames. */
const VALID_HOBBY_IDS = new Set([
  'watercolor-painting',
  'photography',
  'pottery-ceramics',
  'calligraphy',
  'sketching-drawing',
  'acrylic-painting',
  'running',
  'yoga',
  'cycling',
  'swimming',
  'rock-climbing',
  'guitar',
  'piano',
  'singing',
  'gardening',
  'hiking',
  'birdwatching',
  'chess',
  'reading',
  'meditation',
]);

const DAY_REQUIRED_FIELDS = ['day', 'title', 'description', 'duration', 'type', 'tip'];
const TEMPLATE_DIR = path.join(__dirname, 'journeyTemplates');
const EXPECTED_DAY_COUNT = 7;

const isDryRun = process.argv.includes('--dry-run');

/**
 * @param {unknown} data
 * @param {string} hobbyIdFromFilename
 * @returns {{ ok: true, data: object } | { ok: false, reason: string }}
 */
function validateTemplate(data, hobbyIdFromFilename) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'root value must be a JSON object' };
  }

  const template = /** @type {Record<string, unknown>} */ (data);

  if (typeof template.hobbyId !== 'string' || !template.hobbyId.trim()) {
    return { ok: false, reason: 'missing or invalid hobbyId' };
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

  if (template.hobbyId !== hobbyIdFromFilename) {
    return {
      ok: false,
      reason: `hobbyId "${template.hobbyId}" does not match filename "${hobbyIdFromFilename}"`,
    };
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

function listTemplateFiles() {
  if (!fs.existsSync(TEMPLATE_DIR)) {
    return [];
  }

  return fs
    .readdirSync(TEMPLATE_DIR)
    .filter((name) => name.toLowerCase().endsWith('.json'))
    .sort();
}

async function seed() {
  const modeLabel = isDryRun ? ' (dry-run — no writes)' : '';
  console.log(`Seeding journey templates from ${TEMPLATE_DIR}${modeLabel}...\n`);

  const files = listTemplateFiles();
  if (files.length === 0) {
    console.warn(`⚠️  No .json files found in ${TEMPLATE_DIR}`);
    console.log(`\n✅ Seeded 0 templates, 0 skipped, 0 errors`);
    process.exit(0);
  }

  let seeded = 0;
  let skipped = 0;
  let errors = 0;

  for (const fileName of files) {
    const hobbyId = path.basename(fileName, '.json');
    const filePath = path.join(TEMPLATE_DIR, fileName);

    if (!VALID_HOBBY_IDS.has(hobbyId)) {
      console.warn(
        `⚠️  Warning: "${hobbyId}" is not in the hobbies catalog — seeding anyway`
      );
    }

    let raw;
    try {
      raw = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      console.error(`❌ ${fileName}: failed to read file — ${err.message}`);
      errors += 1;
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error(`❌ ${fileName}: invalid JSON — ${err.message}`);
      skipped += 1;
      continue;
    }

    const validation = validateTemplate(parsed, hobbyId);
    if (!validation.ok) {
      console.error(`⏭️  Skipped ${fileName}: ${validation.reason}`);
      skipped += 1;
      continue;
    }

    try {
      if (isDryRun) {
        console.log(`🔍 Would seed: ${hobbyId} (${validation.data.hobbyName})`);
      } else {
        await db.collection('journeyTemplates').doc(hobbyId).set(validation.data);
        console.log(`✅ Seeded: ${hobbyId}`);
      }
      seeded += 1;
    } catch (err) {
      console.error(`❌ ${fileName}: Firestore write failed — ${err.message}`);
      errors += 1;
    }
  }

  console.log(`\n✅ Seeded ${seeded} templates, ${skipped} skipped, ${errors} errors`);
  process.exit(errors > 0 ? 1 : 0);
}

seed().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
