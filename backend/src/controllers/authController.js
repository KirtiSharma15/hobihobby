const { db } = require('../config/firebase');
const asyncHandler = require('express-async-handler');

const syncUser = asyncHandler(async (req, res) => {
  const { uid, email } = req.user;
  const { displayName, photoURL } = req.body;

  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const now = new Date().toISOString();

  if (!userSnap.exists) {
    const newUser = {
      uid,
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      preferences: {},
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await userRef.set(newUser);
    return res.status(201).json({ success: true, data: newUser, isNewUser: true });
  }

  await userRef.update({ updatedAt: now });
  const updatedSnap = await userRef.get();

  return res.status(200).json({
    success: true,
    data: updatedSnap.data(),
    isNewUser: false,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const userSnap = await db.collection('users').doc(uid).get();

  if (!userSnap.exists) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.status(200).json({ success: true, data: userSnap.data() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const { displayName, photoURL, preferences } = req.body;

  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const updates = { updatedAt: new Date().toISOString() };
  if (displayName !== undefined) updates.displayName = displayName;
  if (photoURL !== undefined) updates.photoURL = photoURL;
  if (preferences !== undefined) updates.preferences = preferences;

  await userRef.update(updates);
  const updatedSnap = await userRef.get();

  return res.status(200).json({ success: true, data: updatedSnap.data() });
});

module.exports = { syncUser, getProfile, updateProfile };
