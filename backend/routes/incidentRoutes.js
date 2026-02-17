const express = require("express");
const { incidentValidation } = require("../validators/incidentValidator");

const {
  createIncident,
  getIncidents,
  updateIncidentStatus
} = require("../controllers/incidentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, incidentValidation, createIncident);
router.get("/", protect, getIncidents);
router.put("/:id", protect, adminOnly, updateIncidentStatus);

module.exports = router;