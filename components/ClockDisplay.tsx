import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSettings } from '@/contexts/SettingsContext';

export function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { showClock, clockSize, showSeconds, clockColor } = useSettings();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!showClock) return null;

  return (
    <View style={styles.clockContainer}>
      <ThemedText style={[styles.clockText, { fontSize: clockSize, color: clockColor }]}>
        {currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: showSeconds ? '2-digit' : undefined,
          hour12: false
        })}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  clockContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  clockText: {
    fontWeight: '600',
  },
});
