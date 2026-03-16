import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const isDevelopment = import.meta.env.MODE === "development";

let socket = null;

// Dev-only logging
const log = (...args) => {
  if (isDevelopment) console.log(...args);
};

const logError = (...args) => {
  if (isDevelopment) console.error(...args);
};

export const initializeSocket = (token) => {
  if (socket?.connected) {
    log("✅ Socket already connected");
    return socket;
  }

  if (!token) {
    logError("❌ Socket initialization failed: No token provided");
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => {
    log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    logError("❌ Socket connection error:", error.message);
    // Silent fallback - polling will continue to work
  });

  socket.on("disconnect", (reason) => {
    log("❌ Socket disconnected:", reason);
    // No user notification - polling handles it
  });

  socket.on("reconnect", (attemptNumber) => {
    log("🔄 Socket reconnected after", attemptNumber, "attempts");
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    log("🔌 Socket disconnected manually");
  }
};

export const joinConversation = (conversationId) => {
  if (socket?.connected) {
    socket.emit("join_conversation", conversationId);
    log("📥 Joined conversation:", conversationId);
  }
};

export const leaveConversation = (conversationId) => {
  if (socket?.connected) {
    socket.emit("leave_conversation", conversationId);
    log("📤 Left conversation:", conversationId);
  }
};

export const emitTyping = (conversationId, userName) => {
  if (socket?.connected) {
    socket.emit("typing", { conversationId, userName });
  }
};

export const emitStopTyping = (conversationId) => {
  if (socket?.connected) {
    socket.emit("stop_typing", { conversationId });
  }
};

export const emitMessageRead = (conversationId, messageIds) => {
  if (socket?.connected) {
    socket.emit("message_read", { conversationId, messageIds });
  }
};
