import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  ws: WebSocket | null;
  wsUrl: string;
  setWsUrl: (url: string) => void;
  isConnected: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(18);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = () => {
    if (ws) {
      ws.close();
    }

    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('Connected to server');
      setWs(websocket);
      setIsConnected(true);
    };

    websocket.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return websocket;
  };

  useEffect(() => {
    const loadWsUrl = async () => {
      try {
        const savedWsUrl = await AsyncStorage.getItem('wsUrl');
        if (savedWsUrl) {
          setWsUrl(savedWsUrl);
        }
      } catch (error) {
        console.error('Error loading WebSocket URL:', error);
      }
    };
    loadWsUrl();
  }, []);

  useEffect(() => {
    const websocket = connectWebSocket();
    
    const reconnectInterval = setInterval(() => {
      if (!isConnected) {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }
    }, 1000);

    return () => {
      clearInterval(reconnectInterval);
      websocket.close();
    };
  }, [wsUrl]);

  // Load saved font size on mount
  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('fontSize');
        if (savedFontSize !== null) {
          setFontSize(Number(savedFontSize));
        }
      } catch (error) {
        console.error('Error loading font size:', error);
      }
    };
    loadFontSize();
  }, []);

  const increaseFontSize = async () => {
    const newSize = Math.min(fontSize + 2, 64);
    setFontSize(newSize);
    try {
      await AsyncStorage.setItem('fontSize', newSize.toString());
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const decreaseFontSize = async () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    try {
      await AsyncStorage.setItem('fontSize', newSize.toString());
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      fontSize, 
      increaseFontSize, 
      decreaseFontSize, 
      ws, 
      wsUrl, 
      setWsUrl: async (url: string) => {
        setWsUrl(url);
        try {
          await AsyncStorage.setItem('wsUrl', url);
        } catch (error) {
          console.error('Error saving WebSocket URL:', error);
        }
      },
      isConnected 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
