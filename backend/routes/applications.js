const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Competition = require("../models/Competition");
const { sendAcceptanceEmail } = require("../services/emailService");

// ─── POST /api/applications ──────────────────────────────────────────────────
// Submit a new dance team application
router.post("/", async (req, res, next) => {
  try {
    const {
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      memberCount,
      danceStyle,
      experienceLevel,
      city,
      videoUrl,
      proposal,
      competitionId,
    } = req.body;

    // Validation
    if (!teamName || !leaderName || !leaderEmail || !leaderPhone || !danceStyle || !videoUrl) {
      return res.status(400).json({
        success: false,
        error: "Please fill in all required fields: Team Name, Leader Name, Email, Phone, Dance Style, and Video URL.",
      });
    }

    // Resolve competition if provided or default to first active
    let competition = competitionId;
    if (!competition) {
      const activeComp = await Competition.findOne();
      if (activeComp) competition = activeComp._id;
    }

    const application = await Application.create({
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      memberCount: Number(memberCount) || 5,
      danceStyle,
      experienceLevel: experienceLevel || "Intermediate",
      city: city || "Mumbai",
      videoUrl,
      proposal: proposal || "",
      competition: competition || null,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Your proposal is under review.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/applications ───────────────────────────────────────────────────
// List all applications with optional status filter & search
router.get("/", async (req, res, next) => {
  try {
    const { status, q } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (q) {
      query.$or = [
        { teamName: { $regex: q, $options: "i" } },
        { leaderName: { $regex: q, $options: "i" } },
        { danceStyle: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Fast in-memory counts from single light query
    const allStatuses = await Application.find({}, "status").lean();
    const counts = {
      all: allStatuses.length,
      pending: allStatuses.filter((a) => a.status === "pending").length,
      accepted: allStatuses.filter((a) => a.status === "accepted").length,
      rejected: allStatuses.filter((a) => a.status === "rejected").length,
    };

    res.json({
      success: true,
      counts,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST & GET /api/applications/seed ───────────────────────────────────────
// Seed dummy applications if none exist (for quick testing)
const handleSeed = async (req, res, next) => {
  try {
    const count = await Application.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.json({
        success: true,
        message: `Already has ${count} applications. Use ?force=true to reset.`,
      });
    }

    if (req.query.force) {
      await Application.deleteMany({});
    }

    const comp = await Competition.findOne();
    const compId = comp ? comp._id : null;

    const sampleTeams = [
      {
        teamName: "Urban Beat Breakers",
        leaderName: "Aakash Verma",
        leaderEmail: "delivered@resend.dev",
        leaderPhone: "+91 98765 43210",
        memberCount: 8,
        danceStyle: "Hip-Hop / Popping",
        experienceLevel: "Professional",
        city: "Mumbai",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        proposal: "High-energy synchronized street style piece fusing popping, locking, and krump with dynamic formation transitions.",
        competition: compId,
        status: "pending",
      },
      {
        teamName: "Nritya Tarang",
        leaderName: "Pooja Hegde",
        leaderEmail: "delivered@resend.dev",
        leaderPhone: "+91 98234 56789",
        memberCount: 6,
        danceStyle: "Classical & Semi-Classical",
        experienceLevel: "Advanced",
        city: "Bengaluru",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        proposal: "Kathak and contemporary fusion telling the story of the monsoon using classical mudras and fluid pirouettes.",
        competition: compId,
        status: "accepted",
        emailDelivery: {
          sent: true,
          sentAt: new Date(),
          resendId: "res_mock_101",
        },
      },
      {
        teamName: "Rhythm Rebels Crew",
        leaderName: "Devendra Rathore",
        leaderEmail: "delivered@resend.dev",
        leaderPhone: "+91 97112 33445",
        memberCount: 10,
        danceStyle: "Bollywood / Urban",
        experienceLevel: "Intermediate",
        city: "Delhi",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        proposal: "Bollywood commercial mix with cinematic acrobatic lifts and synchronized hook-step formations.",
        competition: compId,
        status: "pending",
      },
      {
        teamName: "Step Up Sparks",
        leaderName: "Sneha Nair",
        leaderEmail: "delivered@resend.dev",
        leaderPhone: "+91 99456 78123",
        memberCount: 5,
        danceStyle: "Contemporary",
        experienceLevel: "Advanced",
        city: "Kochi",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        proposal: "Soulful lyrical contemporary choreography centered on the concept of liberation and resilience.",
        competition: compId,
        status: "pending",
      },
    ];

    const inserted = await Application.insertMany(sampleTeams);

    res.json({
      success: true,
      message: `Seeded ${inserted.length} sample dance team applications!`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

router.post("/seed", handleSeed);
router.get("/seed", handleSeed);

// ─── GET /api/applications/:id ───────────────────────────────────────────────
// Get single application
router.get("/:id", async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate("competition", "title");
    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/applications/:id/status ──────────────────────────────────────
// Update application status (accept or reject) and trigger Resend email
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'accepted', 'rejected', or 'pending'.",
      });
    }

    const application = await Application.findById(req.params.id).populate("competition", "title");
    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      });
    }

    application.status = status;
    application.statusUpdatedAt = new Date();
    if (reason) application.rejectionReason = reason;

    let emailResult = null;

    // When accepted, send email via Resend!
    if (status === "accepted") {
      emailResult = await sendAcceptanceEmail({
        leaderEmail: application.leaderEmail,
        leaderName: application.leaderName,
        teamName: application.teamName,
        danceStyle: application.danceStyle,
        memberCount: application.memberCount,
        competitionTitle: application.competition ? application.competition.title : "National Dance Championship",
      });

      application.emailDelivery = {
        sent: emailResult.success,
        sentAt: new Date(),
        resendId: emailResult.id || null,
        error: emailResult.error || null,
      };
    }

    await application.save();

    res.json({
      success: true,
      message:
        status === "accepted"
          ? `Application accepted! ${
              emailResult && emailResult.simulated
                ? "Simulated email logged (configure RESEND_API_KEY for live delivery)."
                : "Selection email sent via Resend."
            }`
          : "Application rejected.",
      data: application,
      emailResult,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/applications/:id/status-get (GET convenience for status testing) ─
router.get("/:id/status-get", async (req, res, next) => {
  try {
    const status = req.query.status || "accepted";
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    application.status = status;
    application.statusUpdatedAt = new Date();

    let emailResult = null;
    if (status === "accepted") {
      emailResult = await sendAcceptanceEmail({
        leaderEmail: application.leaderEmail,
        leaderName: application.leaderName,
        teamName: application.teamName,
        danceStyle: application.danceStyle,
        memberCount: application.memberCount,
        competitionTitle: "National Dance Championship",
      });

      application.emailDelivery = {
        sent: emailResult.success,
        sentAt: new Date(),
        resendId: emailResult.id || null,
        error: emailResult.error || null,
      };
    }

    await application.save();

    res.json({
      success: true,
      message: `Updated status to ${status} and triggered Resend email service!`,
      data: application,
      emailResult,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
