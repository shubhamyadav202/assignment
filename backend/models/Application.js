const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    leaderName: {
      type: String,
      required: [true, "Leader / Choreographer name is required"],
      trim: true,
    },
    leaderEmail: {
      type: String,
      required: [true, "Leader email is required"],
      trim: true,
      lowercase: true,
    },
    leaderPhone: {
      type: String,
      required: [true, "Leader phone is required"],
      trim: true,
    },
    memberCount: {
      type: Number,
      required: [true, "Member count is required"],
      min: [1, "Team must have at least 1 member"],
      default: 5,
    },
    danceStyle: {
      type: String,
      required: [true, "Dance style is required"],
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Professional"],
      default: "Intermediate",
    },
    city: {
      type: String,
      trim: true,
      default: "Mumbai",
    },
    videoUrl: {
      type: String,
      required: [true, "Audition / performance video link is required"],
      trim: true,
    },
    proposal: {
      type: String,
      trim: true,
      default: "",
    },
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
    emailDelivery: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      resendId: { type: String, default: null },
      error: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);
