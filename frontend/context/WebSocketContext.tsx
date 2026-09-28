'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface LiveAlert {
  id: string;
  event_type: 'DARK_WEB_LEAK' | 'BANKING_FRAUD' | 'AI_AGENT_CORRELATION' | 'BLOCKCHAIN_ANCHOR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  details: string;
  source: string;
  target_entity: string;
  risk_score: number;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  alerts: LiveAlert[];
  latestAlert: LiveAlert | null;
  dismissLatestAlert: () => void;
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<LiveAlert | null>(null);
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/alerts${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event_type === 'LIVE_ALERT' && data.payload) {
          const newAlert: LiveAlert = data.payload;
          setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]); // keep last 50
          setLatestAlert(newAlert);
        }
      } catch (err) {
        console.warn('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    // Heartbeat ping every 25 seconds
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [isAuthenticated, token]);

  const dismissLatestAlert = () => setLatestAlert(null);
  const clearAlerts = () => setAlerts([]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        alerts,
        latestAlert,
        dismissLatestAlert,
        clearAlerts,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
