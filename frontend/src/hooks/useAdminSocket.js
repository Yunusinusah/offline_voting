// hooks/useAdminSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function _getToken() {
  try {
    return localStorage.getItem('election_token');
  } catch {
    return null;
  }
}

export const useAdminSocket = (shouldConnect = true) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!shouldConnect) return;
    // connect to the admin namespace, include JWT in handshake auth
    const token = _getToken();
    const newSocket = io(`${BASE_URL}/admin`, {
      forceNew: true,
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Admin socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Admin socket connect_error', err && err.message ? err.message : err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [shouldConnect]);

  return { socket, isConnected };
};