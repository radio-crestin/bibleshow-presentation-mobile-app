import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  ws: WebSocket | null;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(18);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3000');
    
    websocket.onopen = () => {
      console.log('Connected to server');
      setWs(websocket);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, []);

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
    <SettingsContext.Provider value={{ fontSize, increaseFontSize, decreaseFontSize, ws }}>
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
