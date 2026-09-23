const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Competition title is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    prizePool: {
      type: Number,
      required: [true, "Prize pool is required"],
      min: 0,
    },
    entryFee: {
      type: Number,
      required: [true, "Entry fee is required"],
      min: 0,
    },
    totalSpots: {
      type: Number,
      required: [true, "Total spots is required"],
      min: 1,
    },
    bookedSpots: {
      type: Number,
      default: 0,
      min: 0,
    },
    certificateForWinners: {
      type: Boolean,
      default: false,
    },

    // ── Judge Info ──────────────────────────────────────────
    judge: {
      name: { type: String, required: true },
      role: { type: String, default: "Judge" },
      description: { type: String },
      experience: { type: String },
      avatarUrl: { type: String },
      introVideoUrl: { type: String },
    },

    // ── Important Dates ────────────────────────────────────
    dates: {
      registrationEnd: { type: Date, required: true },
      submissionStart: { type: Date, required: true },
      submissionEnd: { type: Date, required: true },
      resultDate: { type: Date, required: true },
    },

    // ── Tab Content ────────────────────────────────────────
    aboutContent: {
      type: [String],
      default: [],
    },
    judgingParameters: {
      type: [String],
      default: [],
    },
    rulesAndEligibility: {
      type: [String],
      default: [],
    },

    // ── Rewards ────────────────────────────────────────────
    rewards: [
      {
        position: { type: String, required: true },
        amount: { type: Number, required: true },
        icon: { type: String, default: "⭐" },
      },
    ],

    // ── Misc ───────────────────────────────────────────────
    disclaimer: {
      type: String,
      default: "",
    },
    referralEarning: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: spots left
competitionSchema.virtual("spotsLeft").get(function () {
  return this.totalSpots - this.bookedSpots;
});

// Ensure virtuals are included in JSON/Object output
competitionSchema.set("toJSON", { virtuals: true });
competitionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Competition", competitionSchema);
