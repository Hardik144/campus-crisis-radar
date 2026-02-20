const InvestigationNote = require('../models/InvestigationNote');
const Incident = require('../models/Incident');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { emitToAdmins } = require('../sockets/socketManager');

/**
 * @desc    Add an investigation note to an incident
 * @route   POST /api/incidents/:id/notes
 * @access  Private (Admin only)
 */
const addNote = asyncHandler(async (req, res, next) => {
  const { note } = req.body;

  if (!note || note.trim().length === 0) {
    return next(new AppError('Note content is required.', 400));
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    return next(new AppError('Incident not found.', 404));
  }

  const newNote = await InvestigationNote.create({
    incidentId: incident._id,
    note: note.trim(),
    addedBy: req.user._id,
  });

  await newNote.populate('addedBy', 'name email role');

  // Emit realtime notification
  emitToAdmins('new_note', {
    type: 'NEW_NOTE',
    incidentId: incident._id,
    incidentTitle: incident.title,
    note: newNote,
    addedBy: { id: req.user._id, name: req.user.name },
    timestamp: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Investigation note added.',
    note: newNote,
  });
});

/**
 * @desc    Get all notes for an incident (timeline)
 * @route   GET /api/incidents/:id/notes
 * @access  Private
 */
const getNotes = asyncHandler(async (req, res, next) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    return next(new AppError('Incident not found.', 404));
  }

  // Students can only view notes for their own incidents
  if (
    req.user.role === 'student' &&
    incident.reportedBy.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to view notes for this incident.', 403));
  }

  const notes = await InvestigationNote.find({ incidentId: incident._id })
    .populate('addedBy', 'name email role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: notes.length,
    notes,
  });
});

module.exports = { addNote, getNotes };
