const Incident = require('../models/Incident');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { emitToAdmins, emitToCampus } = require('../sockets/socketManager');

/**
 * @desc    Trigger emergency panic alert
 * @route   POST /api/emergency/panic
 * @access  Private
 */
const triggerPanic = asyncHandler(async (req, res) => {
  const { location, message } = req.body;

  const panicIncident = await Incident.create({
    title: `PANIC ALERT — ${req.user.name}`,
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

  emitToCampus('panic_alert', alertPayload);
  emitToAdmins('panic_alert', alertPayload);

  res.status(201).json({
    success: true,
    message: 'Emergency alert triggered. Help is on the way.',
    incident: panicIncident,
    alertId: panicIncident._id,
  });
});

/**
 * @desc    Cancel a panic alert (false alarm)
 * @route   POST /api/emergency/cancel/:id
 * @access  Private
 */
const cancelPanic = asyncHandler(async (req, res, next) => {
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    return next(new AppError('Incident not found.', 404));
  }

  // Only the reporter or admin can cancel
  if (
    incident.reportedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to cancel this alert.', 403));
  }

  incident.status = 'resolved';
  incident.title = `[FALSE ALARM] ${incident.title}`;
  incident.description = `CANCELLED BY STUDENT — False alarm. Original: ${incident.description}`;
  await incident.save();

  await incident.populate('reportedBy', 'name email role');

  const cancelPayload = {
    type: 'PANIC_CANCELLED',
    incidentId: incident._id,
    title: incident.title,
    cancelledBy: {
      id: req.user._id,
      name: req.user.name,
    },
    timestamp: new Date(),
    incident,
  };

  // Broadcast cancellation to everyone
  emitToCampus('panic_cancelled', cancelPayload);
  emitToAdmins('panic_cancelled', cancelPayload);

  res.status(200).json({
    success: true,
    message: 'Alert cancelled. Marked as false alarm.',
    incident,
  });
});

module.exports = { triggerPanic, cancelPanic };