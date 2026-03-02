import app from "./app.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, "../storage/materials");
try {
  fs.mkdirSync(storageDir, { recursive: true });
} catch (err) {
  console.warn("Could not create storage directory:", err.message);
}

const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize Socket.io
const server = createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io initialized`);
});
