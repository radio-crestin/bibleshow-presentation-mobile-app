import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSettings } from '@/contexts/SettingsContext';
import { IconSymbol } from './ui/IconSymbol';
import { useRouter } from 'expo-router';

export function MicrophoneControl() {
  const [isOn, setIsOn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { 
    colorScheme, 
    normalVerseBackgroundColor, 
    showClock, 
    clockSize, 
    showSeconds, 
    clockColor,
    isConnected
  } = useSettings();
  const router = useRouter();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  const toggleMicrophone = (newState: boolean) => {
    setIsOn(newState);
    // Here you would add the actual microphone control logic
    console.log(`Microphone ${newState ? 'ON' : 'OFF'}`);
  };

  const textColor = normalVerseBackgroundColor === '#000000' ? '#fff' : '#000';
  
  return (
    <View style={[styles.container, { backgroundColor: normalVerseBackgroundColor }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: normalVerseBackgroundColor,
          paddingTop: Platform.OS === 'web' ? 0 : 20
        }
      ]}>
        {showClock && (
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
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 16, marginLeft: 'auto' }}>
          <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
          <Pressable 
            onPress={() => router.push('/settings')}
            style={styles.iconButton}
          >
            <IconSymbol 
              name="gear" 
              size={24} 
              color={normalVerseBackgroundColor === '#000000' ? '#fff' : '#000'} 
            />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: textColor }]}>Control Microfon Tineri</ThemedText>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.onButton,
            isOn && styles.activeButton,
            colorScheme === 'dark' && styles.buttonDark
          ]}
          onPress={() => toggleMicrophone(true)}
        >
          <ThemedText 
            style={[
              styles.buttonText, 
              isOn && styles.activeButtonText,
              { color: textColor }
            ]}
          >
            Pornit
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.offButton,
            !isOn && styles.activeButton,
            colorScheme === 'dark' && styles.buttonDark
          ]}
          onPress={() => toggleMicrophone(false)}
        >
          <ThemedText 
            style={[
              styles.buttonText, 
              !isOn && styles.activeButtonText,
              { color: textColor }
            ]}
          >
            Oprit
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: isOn ? '#4CAF50' : '#FF5252' }
        ]} />
        <ThemedText style={[styles.statusText, { color: textColor }]}>
          Microfonul este {isOn ? 'PORNIT' : 'OPRIT'}
        </ThemedText>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    zIndex: 10,
  },
  clockContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  clockText: {
    fontWeight: '600',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: 200,
  },
  buttonDark: {
    borderColor: '#666',
  },
  onButton: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  offButton: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  activeButton: {
    borderWidth: 3,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  activeButtonText: {
    fontSize: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
