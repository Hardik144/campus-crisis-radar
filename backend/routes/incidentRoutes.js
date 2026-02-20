const express = require('express');
const router = express.Router();

const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident,
} = require('../controllers/incidentController');

const { addNote, getNotes } = require('../controllers/noteController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route POST   /api/incidents
// @route GET    /api/incidents
router.route('/').post(createIncident).get(getIncidents);

// @route GET    /api/incidents/:id
router.route('/:id').get(getIncidentById).delete(adminOnly, deleteIncident);

// @route PUT    /api/incidents/:id/status  (Admin only)
router.put('/:id/status', adminOnly, updateIncidentStatus);

// @route POST   /api/incidents/:id/notes  (Admin only)
// @route GET    /api/incidents/:id/notes
router.route('/:id/notes').post(adminOnly, addNote).get(getNotes);

module.exports = router;
