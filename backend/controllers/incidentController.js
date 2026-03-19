const Incident = require('../models/Incident');
const InvestigationNote = require('../models/InvestigationNote');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { emitToAdmins } = require('../sockets/socketManager');

/**
 * @desc    Create a new incident
 * @route   POST /api/incidents
 * @access  Private (Student/Admin)
 */
const createIncident = asyncHandler(async (req, res, next) => {
  const { title, description, type, priority, location, isAnonymous } = req.body

  if (!title || !description || !type) {
    return next(new AppError('Title, description, and type are required.', 400))
  }

  let parsedLocation = {}
  if (location) {
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location
    } catch {
      parsedLocation = { address: location }
    }
  }

  // Cloudinary stores the URL in req.file.path
  let imageUrl = null
  if (req.file) {
    imageUrl = req.file.path
  }

  const incident = await Incident.create({
    title: title.trim(),
    description: description.trim(),
    type: type.trim(),
    priority: priority || 'medium',
    location: parsedLocation,
    reportedBy: req.user._id,
    isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    imageUrl,
  })

  await incident.populate('reportedBy', 'name email role')

  const incidentData = incident.toObject()

  const socketData = { ...incidentData }
  if (socketData.isAnonymous) {
    socketData.reportedBy = { name: 'Anonymous', email: null }
  }

  emitToAdmins('new_incident', {
    type: 'NEW_INCIDENT',
    incident: socketData,
    timestamp: new Date(),
  })

  res.status(201).json({
    success: true,
    message: 'Incident reported successfully.',
    incident: incidentData,
  })
})

/**
 * @desc    Get incidents
 * @route   GET /api/incidents
 * @access  Private
 */
const getIncidents = asyncHandler(async (req, res) => {
  const { status, priority, type, page = 1, limit = 20 } = req.query

  const filter = {}
  if (req.user.role === 'student') filter.reportedBy = req.user._id
  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (type) filter.type = new RegExp(type, 'i')

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Incident.countDocuments(filter)

  const incidents = await Incident.find(filter)
    .populate('reportedBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const sanitized = incidents.map((inc) => {
    const obj = inc.toObject()
    if (obj.isAnonymous && req.user.role !== 'admin') {
      obj.reportedBy = { name: 'Anonymous', email: null }
    }
    return obj
  })

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    count: incidents.length,
    incidents: sanitized,
  })
})

/**
 * @desc    Get a single incident by ID with notes
 * @route   GET /api/incidents/:id
 * @access  Private
 */
const getIncidentById = asyncHandler(async (req, res, next) => {
  const incident = await Incident.findById(req.params.id).populate(
    'reportedBy',
    'name email role'
  )

  if (!incident) {
    return next(new AppError('Incident not found.', 404))
  }

  if (
    req.user.role === 'student' &&
    incident.reportedBy._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to view this incident.', 403))
  }

  const notes = await InvestigationNote.find({ incidentId: incident._id })
    .populate('addedBy', 'name email role')
    .sort({ createdAt: 1 })

  const incidentData = incident.toObject()

  if (incidentData.isAnonymous && req.user.role !== 'admin') {
    incidentData.reportedBy = { name: 'Anonymous', email: null }
  }

  res.status(200).json({
    success: true,
    incident: incidentData,
    notes,
  })
})

/**
 * @desc    Update incident status
 * @route   PUT /api/incidents/:id/status
 * @access  Private (Admin only)
 */
const updateIncidentStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body
  const validStatuses = ['pending', 'investigating', 'resolved']

  if (!status || !validStatuses.includes(status)) {
    return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}.`, 400))
  }

  const incident = await Incident.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('reportedBy', 'name email role')

  if (!incident) {
    return next(new AppError('Incident not found.', 404))
  }

  emitToAdmins('incident_update', {
    type: 'STATUS_UPDATE',
    incidentId: incident._id,
    newStatus: status,
    updatedBy: { id: req.user._id, name: req.user.name },
    incident,
    timestamp: new Date(),
  })

  res.status(200).json({
    success: true,
    message: `Incident status updated to "${status}".`,
    incident,
  })
})

/**
 * @desc    Delete an incident
 * @route   DELETE /api/incidents/:id
 * @access  Private (Admin only)
 */
const deleteIncident = asyncHandler(async (req, res, next) => {
  const incident = await Incident.findById(req.params.id)

  if (!incident) {
    return next(new AppError('Incident not found.', 404))
  }

  await InvestigationNote.deleteMany({ incidentId: incident._id })
  await incident.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Incident and associated notes deleted successfully.',
  })
})

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident,
}