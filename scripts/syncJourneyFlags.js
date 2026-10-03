/**
 * syncJourneyFlags.js
 *
 * Keeps hobbies.hasJourneyTemplate in sync with journeyTemplates.
 *
 * Usage:
 *   node scripts/syncJourneyFlags.js
 *   node scripts/syncJourneyFlags.js --dry-run
 */

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const isDryRun = process.argv.includes('--dry-run');

async function sync() {
  const modeLabel = isDryRun ? ' (dry-run — no writes)' : '';
  console.log(`Syncing hasJourneyTemplate flags${modeLabel}...\n`);

  const templatesSnap = await db.collection('journeyTemplates').get();
  const templateIds = new Set(templatesSnap.docs.map((docSnap) => docSnap.id));
  console.log(`Found ${templateIds.size} journey template(s).\n`);

  const hobbiesSnap = await db.collection('hobbies').get();
  const total = hobbiesSnap.size;

  if (total === 0) {
    console.warn('⚠️  No hobby documents found.');
    console.log(`\n✅ Synced. 0 flags updated, 0 already correct, 0 hobbies checked.`);
    process.exit(0);
  }

  const updates = [];
  let alreadyCorrect = 0;

  for (const hobbyDoc of hobbiesSnap.docs) {
    const data = hobbyDoc.data();
    const hobbyName = typeof data.name === 'string' ? data.name : hobbyDoc.id;
    const prevValue = Boolean(data.hasJourneyTemplate);
    const nextValue = templateIds.has(hobbyDoc.id);

    if (prevValue === nextValue) {
      alreadyCorrect += 1;
      continue;
    }

    console.log(`🔄 ${hobbyName}: hasJourneyTemplate ${prevValue} → ${nextValue}`);
    updates.push({ ref: hobbyDoc.ref, nextValue });
  }

  if (!isDryRun && updates.length > 0) {
    // Firestore batches are capped at 500 ops; catalog is ~20 hobbies.
    const batch = db.batch();
    for (const update of updates) {
      batch.update(update.ref, { hasJourneyTemplate: update.nextValue });
    }
    await batch.commit();
  }

  console.log(
    `\n✅ Synced. ${updates.length} flags updated, ${alreadyCorrect} already correct, ${total} hobbies checked.`
  );
  process.exit(0);
}

sync().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
