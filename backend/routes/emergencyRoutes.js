const express = require('express');
const router = express.Router();
const { triggerPanic } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/emergency/panic
router.post('/panic', protect, triggerPanic);

module.exports = router;
