const express = require("express");
const {
  createIncident,
  getIncidents,
  updateIncidentStatus
} = require("../controllers/incidentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student can create incident
router.post("/", protect, createIncident);

// Both student & admin can view
router.get("/", protect, getIncidents);

// Only admin can update status
router.put("/:id", protect, adminOnly, updateIncidentStatus);

module.exports = router;