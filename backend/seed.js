/**
 * Seed Script
 * -----------
 * Populates MongoDB with the exact data currently hardcoded in the frontend.
 *
 * Usage: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Competition = require("./models/Competition");
const User = require("./models/User");
const Winner = require("./models/Winner");
const Registration = require("./models/Registration");

const seedData = async () => {
  try {
    await connectDB();

    // ── Clear existing data ────────────────────────────────────────────
    console.log("🗑️  Clearing existing data...");
    await Competition.deleteMany({});
    await User.deleteMany({});
    await Winner.deleteMany({});
    await Registration.deleteMany({});

    // ── Seed Competition ───────────────────────────────────────────────
    console.log("🏆 Seeding competition...");
    const competition = await Competition.create({
      title: "Feedants Classical Dance",
      tags: ["Dance", "Multi-Win"],
      prizePool: 1500,
      entryFee: 99,
      totalSpots: 20,
      bookedSpots: 1,
      certificateForWinners: true,
      judge: {
        name: "Manju Dubey",
        role: "Judge",
        description: "Professional Kathak Dancer",
        experience: "12+ Years of Experience",
        avatarUrl: null,
        introVideoUrl: null,
      },
      dates: {
        registrationEnd: new Date("2026-08-10T23:50:00.000Z"),
        submissionStart: new Date("2026-08-06T04:00:00.000Z"),
        submissionEnd: new Date("2026-08-30T23:55:00.000Z"),
        resultDate: new Date("2026-09-01T23:50:00.000Z"),
      },
      aboutContent: [
        "This is an online classical dance competition open for all age groups.",
        "Participate from anywhere and showcase your talent.",
        "Express your passion through traditional dance.",
      ],
      judgingParameters: [
        "Technique and form accuracy",
        "Expression and emotional depth (abhinaya)",
        "Rhythm and timing (taal)",
        "Costume and presentation",
        "Overall performance impact",
      ],
      rulesAndEligibility: [
        "Open to all age groups",
        "Only classical dance forms are allowed (Bharatanatyam, Kathak, Odissi, Kuchipudi, etc.)",
        "Video must be between 2-5 minutes",
        "Solo performances only",
        "Video must be shot in landscape mode with clear audio",
        "No copyrighted background music allowed",
        "Participants must submit original content only",
      ],
      rewards: [
        { position: "1st Winner", amount: 550, icon: "🏆" },
        { position: "2nd Winner", amount: 300, icon: "🥈" },
        { position: "3rd Winner", amount: 240, icon: "🥉" },
        { position: "4th Winner", amount: 200, icon: "⭐" },
        { position: "5th Winner", amount: 130, icon: "☆" },
        { position: "6th Winner", amount: 80, icon: "☆" },
      ],
      disclaimer:
        "Only contributions from paid participants will be considered for judging.",
      referralEarning: 10,
      status: "active",
    });

    console.log(`   ✅ Competition created: ${competition.title}`);

    // ── Seed Previous Winners ──────────────────────────────────────────
    console.log("🥇 Seeding previous winners...");
    const winners = await Winner.insertMany([
      {
        name: "Riya Shah",
        position: "1st Winner",
        competition: competition._id,
        hasVideo: true,
      },
      {
        name: "Aarav Mehta",
        position: "1st Winner",
        competition: competition._id,
        hasVideo: true,
      },
      {
        name: "Neha Verma",
        position: "2nd Winner",
        competition: competition._id,
        hasVideo: true,
      },
      {
        name: "Ishita Cha...",
        position: "3rd Winner",
        competition: competition._id,
        hasVideo: true,
      },
    ]);

    console.log(`   ✅ ${winners.length} winners created`);

    // ── Seed Sample User ───────────────────────────────────────────────
    console.log("👤 Seeding sample user...");
    const user = await User.create({
      name: "Sample User",
      email: "user@feedants.com",
      phone: "+919876543210",
      referralCode: "referral123",
    });

    console.log(`   ✅ User created: ${user.name} (referral: ${user.referralCode})`);

    // ── Seed Sample Registration ───────────────────────────────────────
    console.log("📋 Seeding sample registration...");
    const registration = await Registration.create({
      user: user._id,
      competition: competition._id,
      status: "registered",
    });

    console.log(`   ✅ Registration created: ${registration.status}`);

    // ── Done ───────────────────────────────────────────────────────────
    console.log("\n🎉 Seed completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   • 1 Competition`);
    console.log(`   • ${winners.length} Previous Winners`);
    console.log(`   • 1 User`);
    console.log(`   • 1 Registration`);
    console.log(`\n📌 Competition ID: ${competition._id}`);
    console.log(`📌 User ID: ${user._id}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedData();
