const Incident = require('../models/Incident');
const asyncHandler = require('../utils/asyncHandler');
const { emitToAdmins, emitToCampus } = require('../sockets/socketManager');

/**
 * @desc    Trigger emergency panic alert
 *          Creates a CRITICAL priority incident and broadcasts to all admins
 * @route   POST /api/emergency/panic
 * @access  Private (any authenticated user)
 */
const triggerPanic = asyncHandler(async (req, res) => {
  const { location, message } = req.body;

  const panicIncident = await Incident.create({
    title: `🚨 PANIC ALERT — ${req.user.name}`,
    description: message || 'Emergency panic button activated. Immediate assistance required.',
    type: 'Emergency Panic',
    status: 'pending',
    priority: 'critical',
    location: location || {},
    reportedBy: req.user._id,
    isAnonymous: false,
  });

  await panicIncident.populate('reportedBy', 'name email role');

  const alertPayload = {
    type: 'PANIC_ALERT',
    incidentId: panicIncident._id,
    title: panicIncident.title,
    triggeredBy: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    location: panicIncident.location,
    timestamp: new Date(),
    incident: panicIncident,
  };

  // Broadcast to admins AND all campus clients
  emitToCampus('panic_alert', alertPayload);
  emitToAdmins('panic_alert', alertPayload);

  res.status(201).json({
    success: true,
    message: 'Emergency alert triggered. Help is on the way.',
    incident: panicIncident,
    alertId: panicIncident._id,
  });
});

module.exports = { triggerPanic };
