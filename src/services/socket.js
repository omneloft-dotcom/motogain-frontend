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
  // Singleton guard: prevent duplicate instances
  if (socket) {
    if (socket.connected) {
      console.log("[SOCKET] already connected:", socket.id);
      return socket;
    }
    // Clean up disconnected instance before creating new one
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  if (!token) {
    console.error("[SOCKET] initialization failed: No token provided");
    return null;
  }

  // Validate socket URL before attempting connection
  if (!isValidSocketUrl(SOCKET_URL)) {
    console.error("[SOCKET] initialization failed: Invalid socket URL", SOCKET_URL);
    return null;
  }

  socket = io(SOCKET_URL, {
    path: "/socket.io/",
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false,
    auth: {
      token,
    },
    reconnection: false,
    timeout: 10000,
  });

  // Prevent duplicate listeners
  socket.off("connect");
  socket.off("connect_error");
  socket.off("disconnect");
  socket.off("reconnect");

  socket.on("connect", () => {
    reconnectAttemptCount = 0; // Reset counter on successful connection
    console.log("[SOCKET] connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    reconnectAttemptCount++;
    console.error(`[SOCKET] connect_error (attempt ${reconnectAttemptCount}/${MAX_RECONNECT_ATTEMPTS}):`, error.message);

    // After max attempts, stop trying and disconnect
    if (reconnectAttemptCount >= MAX_RECONNECT_ATTEMPTS) {
      console.error(`[SOCKET] max attempts reached. Disconnecting. App will use polling fallback.`);
      if (socket) {
        socket.disconnect();
        // Note: Socket will remain disconnected. App should degrade to polling.
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("[SOCKET] disconnected:", reason);
    // No user notification - polling handles it
  });

  socket.on("reconnect", (attemptNumber) => {
    reconnectAttemptCount = 0; // Reset counter on successful reconnect
    console.log("[SOCKET] reconnected after", attemptNumber, "attempts");
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const connectSocket = (token, user) => {
  if (!token || !user) return null;

  const instance = initializeSocket(token);
  if (!instance) return null;

  if (!instance.connected) {
    console.log("SOCKET_INIT", { userId: user?.id || user?._id, hasToken: !!token });
    instance.connect();
  }

  return instance;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.off();
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
