const Incident = require("../models/Incident");

// Create Incident
exports.createIncident = async (req, res) => {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.user.id
    });

    res.status(201).json({
      message: "Incident reported successfully",
      incident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Incidents
exports.getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;

    let query = {};

    // If student → only their incidents
    if (req.user.role !== "admin") {
      query.reportedBy = req.user.id;
    }

    // Filtering
    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const incidents = await Incident.find(query)
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Incident.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      incidents
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Status (Admin Only Later)
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      message: "Incident status updated",
      incident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};