const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Incident type is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, trim: true },
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
incidentSchema.index({ status: 1 });
incidentSchema.index({ priority: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
