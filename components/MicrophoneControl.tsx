import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSettings } from '@/contexts/SettingsContext';

export function MicrophoneControl() {
  const [isOn, setIsOn] = useState(false);
  const { colorScheme } = useSettings();
  
  const toggleMicrophone = (newState: boolean) => {
    setIsOn(newState);
    // Here you would add the actual microphone control logic
    console.log(`Microphone ${newState ? 'ON' : 'OFF'}`);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Control Microfon Tineri</ThemedText>
      
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
              isOn && styles.activeButtonText
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
              !isOn && styles.activeButtonText
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
        <ThemedText style={styles.statusText}>
          Microfonul este {isOn ? 'PORNIT' : 'OPRIT'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
