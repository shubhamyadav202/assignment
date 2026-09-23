const express = require("express");
const router = express.Router();
const Competition = require("../models/Competition");
const Winner = require("../models/Winner");

// ─── GET /api/competitions ──────────────────────────────────────────────────
// List all competitions
router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const competitions = await Competition.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/competitions/:id ──────────────────────────────────────────────
// Get full competition detail (includes winners)
router.get("/:id", async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }

    // Fetch winners for this competition
    const winners = await Winner.find({ competition: competition._id });

    res.json({
      success: true,
      data: {
        ...competition.toJSON(),
        previousWinners: winners,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/competitions ─────────────────────────────────────────────────
// Create a new competition (admin)
router.post("/", async (req, res, next) => {
  try {
    const competition = await Competition.create(req.body);

    res.status(201).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/competitions/:id ──────────────────────────────────────────────
// Update a competition (admin)
router.put("/:id", async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }

    res.json({
      success: true,
      data: competition,
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/competitions/:id ───────────────────────────────────────────
// Delete a competition (admin)
router.delete("/:id", async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: "Competition not found",
      });
    }

    // Also delete associated winners
    await Winner.deleteMany({ competition: req.params.id });

    res.json({
      success: true,
      data: {},
      message: "Competition deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
