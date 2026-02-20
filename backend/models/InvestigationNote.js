const mongoose = require('mongoose');

const investigationNoteSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'Incident ID is required'],
    },
    note: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

investigationNoteSchema.index({ incidentId: 1, createdAt: 1 });

module.exports = mongoose.model('InvestigationNote', investigationNoteSchema);
