require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// ─── Import Routes ─────────────────────────────────────────────────────────
const competitionRoutes = require("./routes/competitions");
const userRoutes = require("./routes/users");
const registrationRoutes = require("./routes/registrations");
const winnerRoutes = require("./routes/winners");
const applicationRoutes = require("./routes/applications");
const uploadRoutes = require("./routes/upload");

// ─── Initialize Express ────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Feedants API Server is running",
    version: "1.0.0",
    endpoints: {
      competitions: "/api/competitions",
      users: "/api/users",
      registrations: "/api/registrations",
      winners: "/api/winners",
      applications: "/api/applications",
    },
  });
});

// ─── Mount Routes ──────────────────────────────────────────────────────────
app.use("/api/competitions", competitionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/upload", uploadRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api\n`);
  });
};

startServer();
