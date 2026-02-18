const Incident = require("../models/Incident");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * @desc    Create new incident
 * @route   POST /api/incidents
 * @access  Private (Student/Admin)
 */
exports.createIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.create({
    ...req.body,
    reportedBy: req.user.id
  });

  res.status(201).json({
    status: "success",
    data: {
      incident
    }
  });
});


/**
 * @desc    Get incidents (Role-based)
 * @route   GET /api/incidents
 * @access  Private
 */
exports.getIncidents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type } = req.query;

  let query = {};

  // If user is not admin → only show their incidents
  if (req.user.role !== "admin") {
    query.reportedBy = req.user.id;
  }

  // Optional filters
  if (status) query.status = status;
  if (type) query.type = type;

  const incidents = await Incident.find(query)
    .populate("reportedBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Incident.countDocuments(query);

  res.json({
    status: "success",
    results: incidents.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: {
      incidents
    }
  });
});


/**
 * @desc    Update incident status
 * @route   PUT /api/incidents/:id
 * @access  Private (Admin only)
 */
exports.updateIncidentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    throw new AppError("Incident not found", 404);
  }

  incident.status = status;
  await incident.save();

  res.json({
    status: "success",
    data: {
      incident
    }
  });
});

/**
 * @desc    Get single incident by ID
 * @route   GET /api/incidents/:id
 * @access  Private
 */
exports.getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate("reportedBy", "name email role");

  if (!incident) {
    throw new AppError("Incident not found", 404);
  }

  // If not admin, make sure student can only see their own incident
  if (
    req.user.role !== "admin" &&
    incident.reportedBy._id.toString() !== req.user.id
  ) {
    throw new AppError("Not authorized to access this incident", 403);
  }

  res.json({
    status: "success",
    data: {
      incident
    }
  });
});