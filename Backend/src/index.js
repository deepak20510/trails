import app from "./app.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, "../storage/materials");
try {
  fs.mkdirSync(storageDir, { recursive: true });
} catch (err) {
  console.warn("Could not create storage directory:", err.message);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
