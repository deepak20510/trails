import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../../../storage/materials");

// Ensure upload directory exists
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  console.error("Failed to create upload directory:", err);
}

const router = express.Router();

// Configure multer for simple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Simple upload endpoint - trainers and institutions only
router.post(
  "/upload",
  authMiddleware(["TRAINER", "INSTITUTION"]),
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const fileUrl = `/materials/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload file",
      });
    }
  },
);

export default router;
