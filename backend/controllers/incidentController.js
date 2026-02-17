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
    const incidents = await Incident.find()
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(incidents);
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