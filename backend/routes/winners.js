const express = require("express");
const router = express.Router();
const Winner = require("../models/Winner");

// ─── GET /api/winners/competition/:compId ───────────────────────────────────
// Get all winners for a competition
router.get("/competition/:compId", async (req, res, next) => {
  try {
    const winners = await Winner.find({
      competition: req.params.compId,
    }).populate("competition", "title");

    res.json({
      success: true,
      count: winners.length,
      data: winners,
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/winners ─────────────────────────────────────────────────────
// Declare winners for a competition (admin)
router.post("/", async (req, res, next) => {
  try {
    const { winners } = req.body;

    if (!Array.isArray(winners) || winners.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Winners array is required",
      });
    }

    const createdWinners = await Winner.insertMany(winners);

    res.status(201).json({
      success: true,
      count: createdWinners.length,
      data: createdWinners,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
