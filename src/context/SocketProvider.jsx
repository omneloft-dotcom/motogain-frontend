import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { initializeSocket, disconnectSocket, getSocket } from "../services/socket";

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
    if (token && user) {
      // Initialize socket with JWT token
      const socket = initializeSocket(token);

      if (socket) {
        socket.on("connect", () => {
          setIsConnected(true);
        });

        socket.on("disconnect", () => {
          setIsConnected(false);
        });

        socket.on("reconnect", () => {
          setIsConnected(true);
        });
      }

      // Cleanup on unmount
      return () => {
        disconnectSocket();
        setIsConnected(false);
      };
    } else {
      // User logged out, disconnect socket
      disconnectSocket();
      setIsConnected(false);
    }
  }, [token, user]);

  const value = {
    socket: getSocket(),
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
