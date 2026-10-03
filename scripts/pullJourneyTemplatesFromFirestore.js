/**
 * pullJourneyTemplatesFromFirestore.js
 *
 * One-way sync: Firestore journeyTemplates → scripts/journeyTemplates/.
 * Fills local gaps (e.g. docs added via console). Never overwrites
 * existing local files — local always wins on conflict.
 *
 * Usage:
 *   node scripts/pullJourneyTemplatesFromFirestore.js
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const TEMPLATE_DIR = path.join(__dirname, 'journeyTemplates');

function toPlainJson(value) {
  if (value === null || value === undefined) return value;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(toPlainJson);
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = toPlainJson(nested);
    }
    return out;
  }
  return value;
}

function shapeTemplate(id, data) {
  const plain = toPlainJson(data) || {};
  return {
    hobbyId: typeof plain.hobbyId === 'string' && plain.hobbyId.trim()
      ? plain.hobbyId
      : id,
    hobbyName: plain.hobbyName ?? '',
    totalDays: typeof plain.totalDays === 'number' ? plain.totalDays : 365,
    days: Array.isArray(plain.days) ? plain.days : [],
  };
}

async function pull() {
  console.log('Pulling journey templates from Firestore → scripts/journeyTemplates/\n');

  const snap = await db.collection('journeyTemplates').get();
  const total = snap.size;

  if (total === 0) {
    console.warn('⚠️  No documents in journeyTemplates.');
    console.log('\n0 pulled down, 0 already present locally, 0 total in Firestore');
    return;
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
  }

  let pulled = 0;
  let alreadyPresent = 0;

  for (const docSnap of snap.docs) {
    const id = docSnap.id;
    const localPath = path.join(TEMPLATE_DIR, `${id}.json`);

    if (fs.existsSync(localPath)) {
      console.log(
        `⚠️  ${id} exists both locally and in Firestore — skipping to avoid overwriting local edits, verify these match manually if needed`
      );
      alreadyPresent += 1;
      continue;
    }

    const shaped = shapeTemplate(id, docSnap.data());
    fs.writeFileSync(localPath, `${JSON.stringify(shaped, null, 2)}\n`, 'utf8');
    console.log(`✅ Pulled: ${id}`);
    pulled += 1;
  }

  console.log(
    `\n${pulled} pulled down, ${alreadyPresent} already present locally, ${total} total in Firestore`
  );
}

pull().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
