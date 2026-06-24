const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { syncUser, getProfile, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/sync', authenticate, syncUser);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
