/**
 * fetchHobbyImages.js
 *
 * Fetches one candidate hero image per hobby from the Pexels API,
 * downloads it locally for human review — never writes to Firestore
 * or Firebase Storage.
 *
 * Usage:
 *   node scripts/fetchHobbyImages.js                  (all hobbies)
 *   node scripts/fetchHobbyImages.js pottery-ceramics  (single hobby)
 *
 * Requires:
 *   - service-account.json at the repo root
 *   - PEXELS_API_KEY in scripts/.env
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const OUTPUT_DIR = path.join(__dirname, 'hobbyImageCandidates');
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';
const RATE_LIMIT_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSearchQuery(hobby) {
  const subcategory = typeof hobby.subcategory === 'string' ? hobby.subcategory.trim() : '';
  const category = typeof hobby.category === 'string' ? hobby.category.trim() : '';
  return `${subcategory} ${category}`.trim();
}

async function fetchHobbies(hobbyIdFilter) {
  if (hobbyIdFilter) {
    const snap = await db.collection('hobbies').doc(hobbyIdFilter).get();
    if (!snap.exists) {
      throw new Error(`Hobby not found in Firestore: ${hobbyIdFilter}`);
    }
    const data = snap.data() || {};
    return [
      {
        id: snap.id,
        name: typeof data.name === 'string' ? data.name : snap.id,
        subcategory: data.subcategory ?? '',
        category: data.category ?? '',
      },
    ];
  }

  const snap = await db.collection('hobbies').get();
  return snap.docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      name: typeof data.name === 'string' ? data.name : docSnap.id,
      subcategory: data.subcategory ?? '',
      category: data.category ?? '',
    };
  });
}

async function searchPexels(query, apiKey) {
  const response = await axios.get(PEXELS_SEARCH_URL, {
    headers: { Authorization: apiKey },
    params: {
      query,
      orientation: 'landscape',
      per_page: 5,
      size: 'medium',
    },
  });
  return Array.isArray(response.data?.photos) ? response.data.photos : [];
}

async function downloadImage(url, destPath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(destPath, Buffer.from(response.data));
}

async function processHobby(hobby, apiKey) {
  const searchQuery = buildSearchQuery(hobby);
  if (!searchQuery) {
    console.warn(
      `⚠️  ${hobby.id} — empty search query (missing subcategory/category), skipped`
    );
    return 'skipped';
  }

  const photos = await searchPexels(searchQuery, apiKey);
  if (photos.length === 0) {
    console.warn(`⚠️  ${hobby.id} — no results for query '${searchQuery}', skipped`);
    return 'skipped';
  }

  const photo = photos[0];
  const imageUrl = photo.src?.large2x || photo.src?.large;
  if (!imageUrl) {
    console.warn(`⚠️  ${hobby.id} — first result has no downloadable src, skipped`);
    return 'skipped';
  }

  const imagePath = path.join(OUTPUT_DIR, `${hobby.id}.jpg`);
  const metaPath = path.join(OUTPUT_DIR, `${hobby.id}.json`);

  await downloadImage(imageUrl, imagePath);

  const metadata = {
    hobbyId: hobby.id,
    hobbyName: hobby.name,
    searchQuery,
    pexelsPhotoId: photo.id,
    pexelsPhotoUrl: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    downloadedAt: new Date().toISOString(),
    alternateOptions: photos.slice(1, 5).map((p) => ({
      id: p.id,
      url: p.url,
      thumbnailPreview: p.src?.small,
    })),
  };

  fs.writeFileSync(metaPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  console.log(`✅ ${hobby.id} — downloaded (query: '${searchQuery}')`);
  return 'downloaded';
}

async function main() {
  const hobbyIdFilter = process.argv[2]?.trim() || null;
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'PEXELS_API_KEY is missing. Add it to scripts/.env (this is a local script, not Firebase secrets).'
    );
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const hobbies = await fetchHobbies(hobbyIdFilter);
  if (hobbies.length === 0) {
    console.warn('⚠️  No hobbies found to process.');
    console.log('Done. 0 images downloaded, 0 skipped, saved to scripts/hobbyImageCandidates/');
    return;
  }

  console.log(
    hobbyIdFilter
      ? `Fetching candidate image for "${hobbyIdFilter}"...\n`
      : `Fetching candidate images for ${hobbies.length} hobbies...\n`
  );

  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < hobbies.length; i += 1) {
    const hobby = hobbies[i];
    try {
      const result = await processHobby(hobby, apiKey);
      if (result === 'downloaded') downloaded += 1;
      else skipped += 1;
    } catch (err) {
      skipped += 1;
      const message = err.response?.data?.error || err.message || err;
      console.error(`⚠️  ${hobby.id} — failed: ${message}`);
    }

    if (i < hobbies.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(
    `\nDone. ${downloaded} images downloaded, ${skipped} skipped, saved to scripts/hobbyImageCandidates/`
  );
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
