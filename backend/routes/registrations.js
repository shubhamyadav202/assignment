const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const Competition = require("../models/Competition");

// ─── POST /api/registrations ────────────────────────────────────────────────
// Register a user for a competition
router.post("/", async (req, res, next) => {
  try {
    const { user, competition } = req.body;

    // Check if competition exists and has spots
    const comp = await Competition.findById(competition);
    if (!comp) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }

    if (comp.bookedSpots >= comp.totalSpots) {
      return res.status(400).json({
        success: false,
        error: "No spots available. Competition is fully booked.",
      });
    }

    // Check registration deadline
    if (new Date() > new Date(comp.dates.registrationEnd)) {
      return res.status(400).json({
        success: false,
        error: "Registration deadline has passed.",
      });
    }

    // Create registration
    const registration = await Registration.create({ user, competition });

    // Increment booked spots
    comp.bookedSpots += 1;
    await comp.save();

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/registrations/user/:userId ────────────────────────────────────
// Get all registrations for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      user: req.params.userId,
    }).populate("competition", "title status dates prizePool");

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/registrations/competition/:compId ─────────────────────────────
// Get all registrants for a competition
router.get("/competition/:compId", async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      competition: req.params.compId,
    }).populate("user", "name email");

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/registrations/:id/submit ──────────────────────────────────────
// Upload submission URL for a registration
router.put("/:id/submit", async (req, res, next) => {
  try {
    const { submissionUrl } = req.body;

    if (!submissionUrl) {
      return res.status(400).json({
        success: false,
        error: "Submission URL is required",
      });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Registration not found",
      });
    }

    // Check submission window
    const competition = await Competition.findById(registration.competition);
    const now = new Date();
    if (
      now < new Date(competition.dates.submissionStart) ||
      now > new Date(competition.dates.submissionEnd)
    ) {
      return res.status(400).json({
        success: false,
        error: "Submission window is not open.",
      });
    }

    registration.submissionUrl = submissionUrl;
    registration.status = "submitted";
    await registration.save();

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
