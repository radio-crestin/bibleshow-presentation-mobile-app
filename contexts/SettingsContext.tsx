import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

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
  clockSize: number;
  setClockSize: (size: number) => void;
  showClock: boolean;
  setShowClock: (show: boolean) => void;
  colorScheme: 'light' | 'dark';
  setColorScheme: (scheme: 'light' | 'dark') => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(18);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [isConnected, setIsConnected] = useState(false);
  const [powerSaveEnabled, setPowerSaveEnabled] = useState(true);
  const [powerSaveTimeout, setPowerSaveTimeout] = useState(30); // 5 minutes default
  const [disconnectedTime, setDisconnectedTime] = useState<Date | null>(new Date());
  const [isPowerSaving, setIsPowerSaving] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [clockSize, setClockSize] = useState(32);
  const [showClock, setShowClock] = useState(true);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(Appearance.getColorScheme() || 'light');

  const connectWebSocket = () => {
    if (ws) {
      ws.close();
    }

    console.log('Connecting to server...');

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
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return websocket;
  };

  // Load saved settings
  // Listen for system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      // Only update if we're not overriding the system setting
      const savedScheme = AsyncStorage.getItem('colorScheme');
      if (!savedScheme) {
        setColorScheme(newColorScheme || 'light');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Apply color scheme to app
  useEffect(() => {
    Appearance.setColorScheme(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedWsUrl, savedPowerSave, savedTimeout, savedShowSeconds, savedClockSize, savedShowClock, savedColorScheme] = await Promise.all([
          AsyncStorage.getItem('wsUrl'),
          AsyncStorage.getItem('powerSaveEnabled'),
          AsyncStorage.getItem('powerSaveTimeout'),
          AsyncStorage.getItem('showSeconds'),
          AsyncStorage.getItem('clockSize'),
          AsyncStorage.getItem('showClock'),
          AsyncStorage.getItem('colorScheme')
        ]);

        if (savedWsUrl) setWsUrl(savedWsUrl);
        if (savedPowerSave) setPowerSaveEnabled(savedPowerSave === 'true');
        if (savedTimeout) setPowerSaveTimeout(Number(savedTimeout));
        if (savedShowSeconds) setShowSeconds(savedShowSeconds === 'true');
        if (savedClockSize) setClockSize(Number(savedClockSize));
        if (savedShowClock) setShowClock(savedShowClock === 'true');
        if (savedColorScheme) setColorScheme(savedColorScheme as 'light' | 'dark');
      } catch (error) {
        console.error('Error loading WebSocket URL:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (!isConnected) {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }
    }, 1000);

    return () => {
      clearInterval(reconnectInterval);
      if(ws) {
        ws.close();
      }
    };
  }, [wsUrl, isConnected]);

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
      const disconnectedSeconds = (now.getTime() - disconnectedTime.getTime()) / 1000;
      const disconnectedMinutes = disconnectedSeconds / 60;
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
      },
      clockSize,
      setClockSize: async (size: number) => {
        setClockSize(size);
        try {
          await AsyncStorage.setItem('clockSize', size.toString());
        } catch (error) {
          console.error('Error saving clock size:', error);
        }
      },
      showClock,
      setShowClock: async (show: boolean) => {
        setShowClock(show);
        try {
          await AsyncStorage.setItem('showClock', show.toString());
        } catch (error) {
          console.error('Error saving show clock setting:', error);
        }
      },
      colorScheme,
      setColorScheme: async (scheme: 'light' | 'dark') => {
        setColorScheme(scheme);
        try {
          await AsyncStorage.setItem('colorScheme', scheme);
        } catch (error) {
          console.error('Error saving color scheme:', error);
        }
      },
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
