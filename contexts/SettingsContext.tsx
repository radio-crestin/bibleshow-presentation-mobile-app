import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Appearance} from 'react-native';
import {persistentState} from "@/contexts/utils";

type SettingsContextType = {
    normalFontSize: number;
    increaseNormalFontSize: () => void;
    decreaseNormalFontSize: () => void;
    highlightedFontSize: number;
    increaseHighlightedFontSize: () => void;
    decreaseHighlightedFontSize: () => void;
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
    clockColor: string;
    setClockColor: (color: string) => void;
    highlightColor: string;
    setHighlightColor: (color: string) => void;
    verseTextColor: string;
    setVerseTextColor: (color: string) => void;
    normalVerseBackgroundColor: string;
    setNormalVerseBackgroundColor: (color: string) => void;
    normalVerseTextColor: string;
    setNormalVerseTextColor: (color: string) => void;
    highlightedTextBold: boolean;
    setHighlightedTextBold: (bold: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export function SettingsProvider({children}: { children: React.ReactNode }) {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [wsUrl, setWsUrl] = persistentState('wsUrl', 'ws://localhost:3000');
    const [isConnected, setIsConnected] = persistentState('isConnected', false);
    const [powerSaveEnabled, setPowerSaveEnabled] = persistentState('powerSaveEnabled', true);
    const [powerSaveTimeout, setPowerSaveTimeout] = persistentState('powerSaveTimeout', 30); // 5 minutes default
    const [disconnectedTime, setDisconnectedTime] = useState<Date | null>(new Date());
    const [isPowerSaving, setIsPowerSaving] = useState(false);
    const [showSeconds, setShowSeconds] = persistentState('showSeconds', true);
    const [clockSize, setClockSize] = persistentState('clockSize', 40);
    const [showClock, setShowClock] = persistentState('showClock', true);
    const [colorScheme, setColorScheme] = persistentState('colorScheme', Appearance.getColorScheme() || 'light');
    const [clockColor, setClockColor] = persistentState('clockColor', '#FF0000'); // Default red
    const [highlightColor, setHighlightColor] = persistentState('highlightColor', '#212121'); // Default orange
    const [verseTextColor, setVerseTextColor] = persistentState('verseTextColor', '#21F900'); // Default black
    const [normalVerseBackgroundColor, setNormalVerseBackgroundColor] = persistentState('normalVerseBackgroundColor', '#000000'); // Default white
    const [normalVerseTextColor, setNormalVerseTextColor] = persistentState('normalVerseTextColor', '#21F900'); // Default black
    const [highlightedTextBold, setHighlightedTextBold] = persistentState('highlightedTextBold', true);
    const [normalFontSize, setNormalFontSize] = persistentState('normalFontSize', 32);
    const [highlightedFontSize, setHighlightedFontSize] = persistentState('highlightedFontSize', 34);

    console.log({
        normalFontSize,
        highlightedFontSize,
        ws,
        wsUrl,
        isConnected,
        powerSaveEnabled,
        powerSaveTimeout,
        isPowerSaving,
        showSeconds,
        clockSize,
        showClock,
        colorScheme,
        clockColor,
        highlightColor,
        verseTextColor,
        normalVerseBackgroundColor,
        normalVerseTextColor,
        highlightedTextBold
    })

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
            if (!disconnectedTime) {
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
        const subscription = Appearance.addChangeListener(({colorScheme: newColorScheme}) => {
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
        const reconnectInterval = setInterval(() => {
            if (!isConnected) {
                console.log('Attempting to reconnect...');
                connectWebSocket();
            }
        }, 1000);

        return () => {
            clearInterval(reconnectInterval);
            if (ws) {
                ws.close();
            }
        };
    }, [wsUrl, isConnected]);

    // Load saved font size on mount
    const increaseNormalFontSize = async () => {
        const newSize = Math.min(normalFontSize + 2, 64);
        setNormalFontSize(newSize);
    };

    const decreaseNormalFontSize = async () => {
        const newSize = Math.max(normalFontSize - 2, 12);
        setNormalFontSize(newSize);
    };

    const increaseHighlightedFontSize = async () => {
        const newSize = Math.min(highlightedFontSize + 2, 64);
        setHighlightedFontSize(newSize);
    };

    const decreaseHighlightedFontSize = async () => {
        const newSize = Math.max(highlightedFontSize - 2, 12);
        setHighlightedFontSize(newSize);
    };

    // Power save effect
    useEffect(() => {
        if (!powerSaveEnabled || isConnected) {
            setIsPowerSaving(false);
            return;
        }

        const checkPowerSave = setInterval(() => {
            const now = new Date();
            if (!disconnectedTime) return;
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
            ws,
            wsUrl,
            setWsUrl,
            isConnected,
            powerSaveEnabled,
            setPowerSaveEnabled,
            powerSaveTimeout,
            setPowerSaveTimeout,
            testPowerSave: () => {
                setIsConnected(false);
                setDisconnectedTime(new Date(Date.now() - powerSaveTimeout * 60 * 1000));
                setIsPowerSaving(true);
            },
            isPowerSaving,
            setIsPowerSaving,
            setDisconnectedTime,
            showSeconds,
            setShowSeconds,
            clockSize,
            setClockSize,
            showClock,
            setShowClock,
            colorScheme,
            setColorScheme,
            clockColor,
            setClockColor,
            highlightColor,
            setHighlightColor,
            verseTextColor,
            setVerseTextColor,
            normalVerseBackgroundColor,
            setNormalVerseBackgroundColor,
            normalVerseTextColor,
            setNormalVerseTextColor,
            highlightedTextBold,
            setHighlightedTextBold,
            normalFontSize,
            increaseNormalFontSize,
            decreaseNormalFontSize,
            highlightedFontSize,
            increaseHighlightedFontSize,
            decreaseHighlightedFontSize
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
