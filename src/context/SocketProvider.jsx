import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { connectSocket as connectSocketService, disconnectSocket, getSocket } from "../services/socket";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      disconnectSocket();
      setIsConnected(false);
    }
  }, [token, user]);

  // Manual connect method - only call from messaging screens
  const connectSocket = () => {
    if (!token || !user) return null;

    const socket = connectSocketService(token, user);
    if (!socket) return null;

    socket.off("connect");
    socket.off("disconnect");

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return socket;
  };

  const value = {
    socket: getSocket(),
    isConnected,
    connectSocket,
    disconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
