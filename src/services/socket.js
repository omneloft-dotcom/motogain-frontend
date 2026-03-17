import { io } from "socket.io-client";
import { config } from "../config/env";

// Use centralized config (production-safe, validated)
const SOCKET_URL = config.socketUrl;
const isDevelopment = config.isDevelopment;

let socket = null;
let reconnectAttemptCount = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Dev-only logging
const log = (...args) => {
  if (isDevelopment) console.log(...args);
};

const logError = (...args) => {
  if (isDevelopment) console.error(...args);
};

// Validate socket URL before connecting
const isValidSocketUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  // Reject localhost in production
  if (config.isProduction && url.includes('localhost')) {
    console.error('[Socket] Invalid URL: localhost detected in production build');
    return false;
  }

  // Reject malformed URLs (double protocol)
  if (url.match(/^https?:\/\/https?:\/\//)) {
    console.error('[Socket] Invalid URL: malformed double protocol detected');
    return false;
  }

  // Reject empty or placeholder URLs
  if (url.trim() === '' || url.includes('undefined') || url.includes('null')) {
    console.error('[Socket] Invalid URL: empty or placeholder value');
    return false;
  }

  return true;
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

  // Validate socket URL before attempting connection
  if (!isValidSocketUrl(SOCKET_URL)) {
    console.error("❌ Socket initialization failed: Invalid socket URL", SOCKET_URL);
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS, // 🔥 FIX: Limit reconnection attempts (was Infinity)
  });

  socket.on("connect", () => {
    reconnectAttemptCount = 0; // Reset counter on successful connection
    log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    reconnectAttemptCount++;
    logError(`❌ Socket connection error (attempt ${reconnectAttemptCount}/${MAX_RECONNECT_ATTEMPTS}):`, error.message);

    // After max attempts, stop trying and disconnect
    if (reconnectAttemptCount >= MAX_RECONNECT_ATTEMPTS) {
      logError(`❌ Socket failed after ${MAX_RECONNECT_ATTEMPTS} attempts. Giving up. App will use polling fallback.`);
      if (socket) {
        socket.disconnect();
        // Note: Socket will remain disconnected. App should degrade to polling.
      }
    }
  });

  socket.on("disconnect", (reason) => {
    log("❌ Socket disconnected:", reason);
    // No user notification - polling handles it
  });

  socket.on("reconnect", (attemptNumber) => {
    reconnectAttemptCount = 0; // Reset counter on successful reconnect
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
