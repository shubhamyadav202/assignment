const express = require("express");
const multer = require("multer");
const { Readable } = require("stream");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const router = express.Router();

// Configure Multer for memory storage with 100MB video limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept video mime types
    if (file.mimetype.startsWith("video/") || file.mimetype === "application/octet-stream") {
      cb(null, true);
    } else {
      cb(new Error("Only video files (MP4, MOV, AVI, etc.) are allowed!"), false);
    }
  },
});

/**
 * POST /api/upload/video
 * Uploads a video file to Cloudinary under folder 'dance_auditions'
 */
router.post("/video", upload.single("video"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No video file provided in form field 'video'.",
      });
    }

    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      console.warn("⚠️ [Cloudinary] Credentials not found in backend/.env.");

      // In development mode, provide a simulated fallback response so the user flow can be tested
      return res.status(200).json({
        success: true,
        simulated: true,
        url: "https://res.cloudinary.com/demo/video/upload/samples/sea-turtle.mp4",
        publicId: "samples/sea-turtle",
        duration: 12.5,
        originalName: req.file.originalname,
        size: req.file.size,
        message:
          "Simulated Cloudinary upload. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env for live Cloudinary storage.",
      });
    }

    console.log(
      `☁️ [Cloudinary] Uploading video: ${req.file.originalname} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB)`
    );

    // Stream upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "dance_auditions",
            public_id: `audition_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary upload error:", error);
              return reject(error);
            }
            resolve(result);
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    console.log(`✅ [Cloudinary] Video uploaded successfully: ${result.secure_url}`);

    res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
      message: "Video uploaded to Cloudinary successfully!",
    });
  } catch (error) {
    console.error("Upload route error:", error);
    next(error);
  }
});

module.exports = router;
