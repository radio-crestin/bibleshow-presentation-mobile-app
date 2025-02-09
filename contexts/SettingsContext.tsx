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
  isPowerSaving: boolean;
  setIsPowerSaving: (value: boolean) => void;
  setDisconnectedTime: (date: Date) => void;
  showSeconds: boolean;
  setShowSeconds: (show: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(18);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [isConnected, setIsConnected] = useState(false);
  const [powerSaveEnabled, setPowerSaveEnabled] = useState(false);
  const [powerSaveTimeout, setPowerSaveTimeout] = useState(30); // 5 minutes default
  const [disconnectedTime, setDisconnectedTime] = useState<Date | null>(new Date());
  const [isPowerSaving, setIsPowerSaving] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);

  const connectWebSocket = () => {
    if (ws) {
      ws.close();
    }

    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('Connected to server');
      setWs(websocket);
      setIsConnected(true);
      setDisconnectedTime(null);
    };

    websocket.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setWs(null);
      if(!disconnectedTime) {
        setDisconnectedTime(new Date());
      }
    };

    websocket.onerror = (error) => {
      // console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return websocket;
  };

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedWsUrl, savedPowerSave, savedTimeout, savedShowSeconds] = await Promise.all([
          AsyncStorage.getItem('wsUrl'),
          AsyncStorage.getItem('powerSaveEnabled'),
          AsyncStorage.getItem('powerSaveTimeout'),
          AsyncStorage.getItem('showSeconds')
        ]);

        if (savedWsUrl) setWsUrl(savedWsUrl);
        if (savedPowerSave) setPowerSaveEnabled(savedPowerSave === 'true');
        if (savedTimeout) setPowerSaveTimeout(Number(savedTimeout));
        if (savedShowSeconds) setShowSeconds(savedShowSeconds === 'true');
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
    if (!powerSaveEnabled || isConnected) {
      setIsPowerSaving(false);
      return;
    }

    const checkPowerSave = setInterval(() => {
      const now = new Date();
      if(!disconnectedTime) return;
      const disconnectedMinutes = (now.getTime() - disconnectedTime.getTime()) / (1000 * 60);
      console.log({disconnectedMinutes})
      
      if (disconnectedMinutes >= powerSaveTimeout) {
        setIsPowerSaving(true);
      }
    }, 1000); // Check every second

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
        setIsPowerSaving(true);
      },
      isPowerSaving,
      setIsPowerSaving,
      setDisconnectedTime,
      showSeconds,
      setShowSeconds: async (show: boolean) => {
        setShowSeconds(show);
        try {
          await AsyncStorage.setItem('showSeconds', show.toString());
        } catch (error) {
          console.error('Error saving show seconds setting:', error);
        }
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
