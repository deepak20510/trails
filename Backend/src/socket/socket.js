import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../db.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER || "trainer-platform",
        audience: process.env.JWT_AUDIENCE || "trainer-users",
      });
      
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicator
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping,
      });
    });

    // Mark messages as read
    socket.on("mark_read", async ({ conversationId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: socket.userId },
            isRead: false,
          },
          data: { isRead: true },
        });

        socket.to(`conversation:${conversationId}`).emit("messages_read", {
          conversationId,
          readBy: socket.userId,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Helper functions to emit events
export const emitNewMessage = (conversationId, message) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit("new_message", message);
  }
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
};
