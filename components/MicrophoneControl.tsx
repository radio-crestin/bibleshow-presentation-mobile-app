import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSettings } from '@/contexts/SettingsContext';

export function MicrophoneControl() {
  const [isOn, setIsOn] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
    colorScheme, 
    normalVerseBackgroundColor, 
    ws,
    isConnected
  } = useSettings();
  
  // Listen for microphone status updates from the server
  useEffect(() => {
    if (!ws) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'microphoneStatus') {
          setIsOn(data.status === 'on');
          setIsUpdating(false);
          setIsInitializing(false);
          console.log(`Received microphone status: ${data.status}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
    
    ws.addEventListener('message', handleMessage);
    
    // Request current microphone status on connection
    const requestStatus = () => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'getMicrophoneStatus' }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error requesting microphone status:', error);
        return false;
      }
    };
    
    // Try to request status immediately and retry after a delay
    requestStatus();
    
    // Set up multiple retries to ensure we get the status
    const retryTimeouts = [
      setTimeout(requestStatus, 1000),
      setTimeout(requestStatus, 3000),
      setTimeout(() => {
        requestStatus();
        // If we still don't have a status after 5 seconds, stop showing the initializing state
        setTimeout(() => {
          if (isInitializing) {
            setIsInitializing(false);
          }
        }, 2000);
      }, 5000)
    ];
    
    // Set up periodic sync every 5 seconds
    const syncInterval = setInterval(() => {
      if (!requestStatus()) {
        // If request fails, mark as disconnected
        console.log('Periodic sync failed, connection may be lost');
      }
    }, 5000);
    
    return () => {
      ws.removeEventListener('message', handleMessage);
      retryTimeouts.forEach(timeout => clearTimeout(timeout));
      clearInterval(syncInterval);
    };
  }, [ws]);
  
  // Re-request status when connection is restored
  useEffect(() => {
    if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
      setIsInitializing(true);
      ws.send(JSON.stringify({ type: 'getMicrophoneStatus' }));
    }
  }, [isConnected]);
  
  const toggleMicrophone = (newState: boolean) => {
    // Only proceed if we're not already updating
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Send microphone control command to the server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'microphone',
        action: newState ? 'on' : 'off'
      }));
      console.log(`Microphone command sent: ${newState ? 'ON' : 'OFF'}`);
    } else {
      console.log(`WebSocket not connected. Cannot change microphone state.`);
      setIsUpdating(false);
    }
  };

  const textColor = normalVerseBackgroundColor === '#000000' ? '#fff' : '#000';
  
  return (
    <View style={[styles.container, { backgroundColor: normalVerseBackgroundColor }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: textColor }]}>Control Microfon Tineri</ThemedText>
      
      {isInitializing || !isConnected ? (
        <View style={styles.initializingContainer}>
          <ActivityIndicator size="large" color={textColor} />
          <ThemedText style={[styles.initializingText, { color: textColor }]}>
            {isInitializing 
              ? 'Se încarcă starea microfonului...'
              : 'Se așteaptă conexiunea la server...'}
          </ThemedText>
        </View>
      ) : (
        <>
        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.onButton,
            isOn && styles.activeButton,
            colorScheme === 'dark' && styles.buttonDark,
            isUpdating && styles.updatingButton
          ]}
          onPress={() => toggleMicrophone(true)}
          disabled={isUpdating || !isConnected}
        >
          <ThemedText 
            style={[
              styles.buttonText, 
              isOn && styles.activeButtonText,
              { color: textColor },
              (isUpdating || !isConnected) && styles.disabledText
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
            colorScheme === 'dark' && styles.buttonDark,
            isUpdating && styles.updatingButton
          ]}
          onPress={() => toggleMicrophone(false)}
          disabled={isUpdating || !isConnected}
        >
          <ThemedText 
            style={[
              styles.buttonText, 
              !isOn && styles.activeButtonText,
              { color: textColor },
              (isUpdating || !isConnected) && styles.disabledText
            ]}
          >
            Oprit
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: isOn ? '#4AFF50' : '#FF3A3A' }
        ]} />
        <ThemedText style={[styles.statusText, { color: textColor }]}>
          Microfonul este {isOn ? 'PORNIT' : 'OPRIT'}
        </ThemedText>
      </View>
      
      {isUpdating && (
        <View style={styles.updatingContainer}>
          <ThemedText style={[styles.updatingText, { color: textColor }]}>
            Se actualizează...
          </ThemedText>
        </View>
      )}
      </>
      )}
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
    borderColor: '#4AFF50',
    backgroundColor: 'rgba(74, 255, 80, 0.3)',
  },
  offButton: {
    borderColor: '#FF3A3A',
    backgroundColor: 'rgba(255, 58, 58, 0.3)',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  updatingButton: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.5,
  },
  updatingContainer: {
    marginTop: 20,
  },
  updatingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  initializingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  initializingText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
