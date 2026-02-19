const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["Medical", "Harassment", "Infrastructure", "Other", "Emergency"],
      required: true
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Investigating", "Resolved"],
      default: "Pending"
    },

    investigationNotes: [
      {
        note: {
          type: String,
          required: true
        },

        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Incident", incidentSchema);