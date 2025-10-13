const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { getMyProfile, createOrUpdateProfile } = require('../controllers/profileController');

// @route   GET /api/profile/me
// @desc    Get the current user's profile
router.get('/me', authMiddleware, getMyProfile);

// @route   POST /api/profile
// @desc    Create or update the current user's profile
router.post('/', authMiddleware, createOrUpdateProfile);

module.exports = router;
