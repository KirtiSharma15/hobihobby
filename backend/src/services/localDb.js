// Simple in-memory user profile store for local dev mode (no Firebase)
const userProfiles = new Map(); // key: uid, value: profile object

function createUserProfile(user) {
  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en',
    },
    onboardingCompleted: false,
    savedHobbies: [],
    completedHobbies: [],
    activity: [],
    onboardingAnswers: [],
  };
  userProfiles.set(user.uid, profile);
  return profile;
}

function getUserProfile(uid) {
  return userProfiles.get(uid) || null;
}

function updateUserProfile(uid, updates) {
  const current = userProfiles.get(uid) || null;
  if (!current) return null;
  const next = { ...current, ...updates, updatedAt: new Date() };
  userProfiles.set(uid, next);
  return next;
}

module.exports = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
};







