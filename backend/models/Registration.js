const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: [true, "Competition is required"],
    },
    status: {
      type: String,
      enum: ["registered", "submitted", "judged"],
      default: "registered",
    },
    submissionUrl: {
      type: String,
      default: null,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations (one user per competition)
registrationSchema.index({ user: 1, competition: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
