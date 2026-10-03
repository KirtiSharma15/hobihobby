/**
 * uploadHobbyImages.js
 *
 * Uploads reviewed candidate hero images from
 * scripts/hobbyImageCandidates/ to Firebase Storage and writes
 * the public URL (+ credit metadata) onto each hobby document.
 *
 * Usage:
 *   node scripts/uploadHobbyImages.js                  (all reviewed candidates)
 *   node scripts/uploadHobbyImages.js pottery-ceramics  (single hobby)
 *   node scripts/uploadHobbyImages.js --dry-run         (validate only, no writes)
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

const STORAGE_BUCKET = 'hobihobby-65e1a.firebasestorage.app';
const CANDIDATES_DIR = path.join(__dirname, 'hobbyImageCandidates');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const isDryRun = process.argv.includes('--dry-run');
const hobbyIdArg = process.argv.slice(2).find((arg) => arg !== '--dry-run')?.trim() || null;

function listCandidateHobbyIds() {
  if (!fs.existsSync(CANDIDATES_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CANDIDATES_DIR)
    .filter((name) => name.endsWith('.jpg'))
    .map((name) => path.basename(name, '.jpg'))
    .sort();
}

function resolveHobbyIds() {
  if (hobbyIdArg) {
    return [hobbyIdArg];
  }
  return listCandidateHobbyIds();
}

async function processHobby(hobbyId) {
  const imagePath = path.join(CANDIDATES_DIR, `${hobbyId}.jpg`);
  const metaPath = path.join(CANDIDATES_DIR, `${hobbyId}.json`);
  const destination = `hobby-images/${hobbyId}.jpg`;

  if (!fs.existsSync(imagePath) || !fs.existsSync(metaPath)) {
    console.warn(
      `⚠️  ${hobbyId} — missing ${!fs.existsSync(imagePath) ? '.jpg' : ''}${
        !fs.existsSync(imagePath) && !fs.existsSync(metaPath) ? ' and ' : ''
      }${!fs.existsSync(metaPath) ? '.json' : ''} in hobbyImageCandidates/, skipped`
    );
    return 'skipped';
  }

  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (err) {
    console.warn(`⚠️  ${hobbyId} — invalid metadata JSON (${err.message}), skipped`);
    return 'skipped';
  }

  const hobbyRef = db.collection('hobbies').doc(hobbyId);
  const hobbySnap = await hobbyRef.get();
  if (!hobbySnap.exists) {
    console.warn(`⚠️  ${hobbyId} — no hobbies/${hobbyId} document in Firestore, skipped`);
    return 'skipped';
  }

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

  if (isDryRun) {
    console.log(`🔍 Would upload: ${hobbyId} → ${destination}`);
    return 'uploaded';
  }

  await bucket.upload(imagePath, {
    destination,
    metadata: {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    },
  });

  const file = bucket.file(destination);
  await file.makePublic();

  await hobbyRef.set(
    {
      imageUrl: publicUrl,
      imageCredit: {
        photographer: metadata.photographer ?? '',
        photographerUrl: metadata.photographerUrl ?? '',
        source: 'pexels',
        pexelsPhotoUrl: metadata.pexelsPhotoUrl ?? '',
      },
      imageUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`✅ ${hobbyId} — uploaded to Storage, Firestore updated`);
  return 'uploaded';
}

async function main() {
  const hobbyIds = resolveHobbyIds();
  const modeLabel = isDryRun ? ' (dry-run — no writes)' : '';

  if (hobbyIds.length === 0) {
    console.warn('⚠️  No candidate images found in scripts/hobbyImageCandidates/');
    console.log('Done. 0 images uploaded, 0 skipped, 0 errors.');
    return;
  }

  console.log(
    hobbyIdArg
      ? `Uploading candidate image for "${hobbyIdArg}"${modeLabel}...\n`
      : `Uploading ${hobbyIds.length} candidate image(s)${modeLabel}...\n`
  );
  console.log(`Storage bucket: ${bucket.name}\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const hobbyId of hobbyIds) {
    try {
      const result = await processHobby(hobbyId);
      if (result === 'uploaded') uploaded += 1;
      else skipped += 1;
    } catch (err) {
      errors += 1;
      const message = err.response?.data?.error || err.message || err;
      console.error(`⚠️  ${hobbyId} — error: ${message}`);
    }
  }

  console.log(
    `\nDone. ${uploaded} images uploaded, ${skipped} skipped, ${errors} errors.`
  );
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
