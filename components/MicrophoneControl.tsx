import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSettings } from '@/contexts/SettingsContext';

export function MicrophoneControl() {
  const [isOn, setIsOn] = useState(false);
  const { 
    colorScheme, 
    normalVerseBackgroundColor, 
    ws
  } = useSettings();
  
  // Listen for microphone status updates from the server
  useEffect(() => {
    if (!ws) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'microphoneStatus') {
          setIsOn(data.status === 'on');
          console.log(`Received microphone status: ${data.status}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
    
    ws.addEventListener('message', handleMessage);
    
    // Request current microphone status on connection
    const requestStatus = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'getMicrophoneStatus' }));
      }
    };
    
    // Try to request status immediately and retry after a delay
    requestStatus();
    const retryTimeout = setTimeout(requestStatus, 1000);
    
    return () => {
      ws.removeEventListener('message', handleMessage);
      clearTimeout(retryTimeout);
    };
  }, [ws]);
  
  const toggleMicrophone = (newState: boolean) => {
    setIsOn(newState);
    
    // Send microphone control command to the server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'microphone',
        action: newState ? 'on' : 'off'
      }));
      console.log(`Microphone command sent: ${newState ? 'ON' : 'OFF'}`);
    } else {
      console.log(`WebSocket not connected. Microphone state changed locally: ${newState ? 'ON' : 'OFF'}`);
    }
  };

  const textColor = normalVerseBackgroundColor === '#000000' ? '#fff' : '#000';
  
  return (
    <View style={[styles.container, { backgroundColor: normalVerseBackgroundColor }]}>
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
