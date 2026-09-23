const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ─── POST /api/users/register ───────────────────────────────────────────────
// Create a new user account
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, referralCode } = req.body;

    // Check if referred by someone
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        // Credit referral earning to the referrer
        referrer.referralEarnings += 10;
        await referrer.save();
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      referredBy,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/users/:id ────────────────────────────────────────────────────
// Get user profile
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "referredBy",
      "name email"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/users/:id/referral ────────────────────────────────────────────
// Get user's referral link & earnings
router.get("/:id/referral", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `https://feedants.com/r/${user.referralCode}`,
        referralEarnings: user.referralEarnings,
        earningPerSignup: 10,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
