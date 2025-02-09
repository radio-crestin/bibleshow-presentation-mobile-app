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
  powerSaveEnabled: boolean;
  setPowerSaveEnabled: (enabled: boolean) => void;
  powerSaveTimeout: number;
  setPowerSaveTimeout: (minutes: number) => void;
  testPowerSave: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(18);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [isConnected, setIsConnected] = useState(false);
  const [powerSaveEnabled, setPowerSaveEnabled] = useState(false);
  const [powerSaveTimeout, setPowerSaveTimeout] = useState(5); // 5 minutes default
  const [disconnectedTime, setDisconnectedTime] = useState<Date | null>(null);

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
      setDisconnectedTime(new Date());
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return websocket;
  };

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedWsUrl, savedPowerSave, savedTimeout] = await Promise.all([
          AsyncStorage.getItem('wsUrl'),
          AsyncStorage.getItem('powerSaveEnabled'),
          AsyncStorage.getItem('powerSaveTimeout')
        ]);

        if (savedWsUrl) setWsUrl(savedWsUrl);
        if (savedPowerSave) setPowerSaveEnabled(savedPowerSave === 'true');
        if (savedTimeout) setPowerSaveTimeout(Number(savedTimeout));
      } catch (error) {
        console.error('Error loading WebSocket URL:', error);
      }
    };
    loadSettings();
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

  // Power save effect
  useEffect(() => {
    if (!powerSaveEnabled || isConnected || !disconnectedTime) return;

    const checkPowerSave = setInterval(() => {
      const now = new Date();
      const disconnectedMinutes = (now.getTime() - disconnectedTime.getTime()) / (1000 * 60);
      
      if (disconnectedMinutes >= powerSaveTimeout) {
        // Implement screen dimming here
        console.log('Screen should be dimmed now');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkPowerSave);
  }, [powerSaveEnabled, isConnected, disconnectedTime, powerSaveTimeout]);

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
      isConnected,
      powerSaveEnabled,
      setPowerSaveEnabled: async (enabled: boolean) => {
        setPowerSaveEnabled(enabled);
        try {
          await AsyncStorage.setItem('powerSaveEnabled', enabled.toString());
        } catch (error) {
          console.error('Error saving power save setting:', error);
        }
      },
      powerSaveTimeout,
      setPowerSaveTimeout: async (minutes: number) => {
        setPowerSaveTimeout(minutes);
        try {
          await AsyncStorage.setItem('powerSaveTimeout', minutes.toString());
        } catch (error) {
          console.error('Error saving power save timeout:', error);
        }
      },
      testPowerSave: () => {
        setIsConnected(false);
        setDisconnectedTime(new Date(Date.now() - powerSaveTimeout * 60 * 1000));
      }
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
