const express = require('express');
const router = express.Router();
const { triggerPanic, cancelPanic } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/emergency/panic
router.post('/panic', protect, triggerPanic);

// @route POST /api/emergency/cancel/:id
router.post('/cancel/:id', protect, cancelPanic);

module.exports = router;