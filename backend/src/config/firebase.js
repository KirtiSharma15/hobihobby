const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

let lastHasCreds = false;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    const hasCreds = Boolean(process.env.FIREBASE_CREDENTIALS_BASE64) || (
      Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
      Boolean(process.env.FIREBASE_PRIVATE_KEY) &&
      !/Your Private Key Here/i.test(process.env.FIREBASE_PRIVATE_KEY || '')
    );
    lastHasCreds = hasCreds;

    const forcedLocal = String(process.env.USE_LOCAL_AUTH || '').toLowerCase() === 'true';
    if (forcedLocal || !hasCreds) {
      // Skip Firebase init; local auth will be used
      return null;
    }

    // Prefer base64-encoded full service account JSON to avoid newline issues
    let credential;
    const base64Credentials = process.env.FIREBASE_CREDENTIALS_BASE64;
    if (base64Credentials) {
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const json = JSON.parse(decoded);
      credential = admin.credential.cert(json);
    } else {
      // Initialize with individual env vars
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
      const normalizedPrivateKey = privateKeyRaw
        ? privateKeyRaw
            .replace(/^"+|"+$/g, '') // strip surrounding quotes if any
            .replace(/\\n/g, '\n') // replace literal \n with newlines
        : undefined;

      const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: normalizedPrivateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      };

      credential = admin.credential.cert(serviceAccount);
    }

    const app = admin.initializeApp({
      credential,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

const isFirebaseEnabled = () => admin.apps.length > 0;
const isFirebaseConfigured = () => lastHasCreds;

// Ensure app is initialized before returning services
const ensureInitialized = () => {
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
};

// Get Firebase services
const getAuth = () => { ensureInitialized(); return admin.auth(); };
const getFirestore = () => { ensureInitialized(); return admin.firestore(); };
const getStorage = () => { ensureInitialized(); return admin.storage(); };

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying Firebase ID token:', error);
    throw error;
  }
};

// Create custom token
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    logger.error('Error creating custom token:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getAuth,
  getFirestore,
  getStorage,
  verifyIdToken,
  createCustomToken,
  initializeFirebase,
  isFirebaseEnabled,
  isFirebaseConfigured,
}; 