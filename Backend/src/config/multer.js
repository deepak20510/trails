import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../../storage/materials");

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  console.warn("Could not create materials upload dir:", err.message);
}

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID();
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});