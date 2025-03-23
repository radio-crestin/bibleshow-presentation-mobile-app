import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSettings } from '@/contexts/SettingsContext';
import { useMicrophoneContext } from './MicrophoneContext';

// Scene mapping configuration
const SCENE_CONFIG = {
  PORNIT: 'solo',
  OPRIT: 'tineri',
  FINISH: 'sala'
};

type SceneType = 'pornit' | 'oprit' | 'finish';

export function MicrophoneControl() {
  const [activeScene, setActiveScene] = useState<SceneType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { isUpdating, setIsUpdating } = useMicrophoneContext();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const { 
    colorScheme, 
    normalVerseBackgroundColor, 
    ws,
    isConnected
  } = useSettings();
  
  // Listen for scene status updates from the server
  useEffect(() => {
    if (!ws) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sceneStatus' || data.type === 'obsSceneChanged') {
          console.log(`Received scene status: ${data.scene}`);
          
          // Map the received OBS scene name to our scene type
          const mappedScene = mapSceneToType(data.scene);
          if (mappedScene) {
            setActiveScene(mappedScene);
          } else if (data.scene) {
            // If we receive a direct scene type (for backward compatibility)
            setActiveScene(data.scene as SceneType);
          }
          
          setIsUpdating(false);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
    
    ws.addEventListener('message', handleMessage);
    
    // Request current scene status on connection
    const requestStatus = () => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'getObsSceneStatus' }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error requesting scene status:', error);
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
      ws.send(JSON.stringify({ type: 'getObsSceneStatus' }));
    }
  }, [isConnected]);
  
  // Map received scene name to our scene type
  const mapSceneToType = (sceneName: string): SceneType | null => {
    if (sceneName === SCENE_CONFIG.PORNIT) return 'pornit';
    if (sceneName === SCENE_CONFIG.OPRIT) return 'oprit';
    if (sceneName === SCENE_CONFIG.FINISH) return 'finish';
    return null;
  };

  const changeScene = (scene: SceneType) => {
    // Only proceed if we're not already updating
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Map the scene type to the actual OBS scene name
    let obsSceneName = '';
    if (scene === 'pornit') obsSceneName = SCENE_CONFIG.PORNIT;
    else if (scene === 'oprit') obsSceneName = SCENE_CONFIG.OPRIT;
    else if (scene === 'finish') obsSceneName = SCENE_CONFIG.FINISH;
    
    // Send scene change command to the server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'changeObsScene',
        scene: obsSceneName
      }));
      console.log(`Scene change command sent: ${scene} (OBS scene: ${obsSceneName})`);
    } else {
      console.log(`WebSocket not connected. Cannot change scene.`);
      setIsUpdating(false);
    }
  };

  const textColor = normalVerseBackgroundColor === '#000000' ? '#fff' : '#000';
  
  return (
    <View style={[styles.container, { backgroundColor: normalVerseBackgroundColor }]}>
      <View style={[
        styles.content,
        isLandscape && styles.contentLandscape
      ]}>
        <View style={styles.controlsContainer}>
          {isInitializing || !isConnected ? (
            <View style={styles.initializingContainer}>
              <ActivityIndicator size="large" color={textColor} />
              <ThemedText style={[styles.initializingText, { color: textColor }]}>
                {isInitializing 
                  ? 'Se încarcă starea scenei...'
                  : 'Se așteaptă conexiunea la server...'}
              </ThemedText>
            </View>
          ) : (
            <>
            <View style={styles.mainControlsArea}>
              <View style={[
                styles.buttonsLayout,
                isLandscape && styles.buttonsLayoutLandscape
              ]}>
                <View style={[
                  styles.buttonContainer,
                  isLandscape && styles.buttonContainerLandscape
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.startButton,
                      isLandscape && styles.buttonLandscape,
                      activeScene === 'pornit' && styles.activeButton,
                      colorScheme === 'dark' && styles.buttonDark,
                      isUpdating && styles.updatingButton,
                      activeScene === 'pornit' && { backgroundColor: 'rgba(74, 255, 80, 0.5)' }
                    ]}
                    onPress={() => changeScene('pornit')}
                    disabled={isUpdating || !isConnected}
                  >
                    <ThemedText 
                      style={[
                        styles.buttonText, 
                        activeScene === 'pornit' && styles.activeButtonText,
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
                      styles.stopButton,
                      isLandscape && styles.buttonLandscape,
                      activeScene === 'oprit' && styles.activeButton,
                      colorScheme === 'dark' && styles.buttonDark,
                      isUpdating && styles.updatingButton,
                      activeScene === 'oprit' && { backgroundColor: 'rgba(255, 0, 0, 0.6)' }
                    ]}
                    onPress={() => changeScene('oprit')}
                    disabled={isUpdating || !isConnected}
                  >
                    <ThemedText 
                      style={[
                        styles.buttonText, 
                        activeScene === 'oprit' && styles.activeButtonText,
                        { color: textColor },
                        (isUpdating || !isConnected) && styles.disabledText
                      ]}
                    >
                      Oprit
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={[
                  styles.rightContainer,
                  isLandscape && styles.rightContainerLandscape
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.fullWidthButton,
                      styles.endButton,
                      isLandscape && styles.fullWidthButtonLandscape,
                      activeScene === 'finish' && styles.activeButton,
                      colorScheme === 'dark' && styles.buttonDark,
                      isUpdating && styles.updatingButton,
                      activeScene === 'finish' && { backgroundColor: 'rgba(255, 165, 0, 0.6)' }
                    ]}
                    onPress={() => changeScene('finish')}
                    disabled={isUpdating || !isConnected}
                  >
                    <ThemedText 
                      style={[
                        styles.buttonText, 
                        activeScene === 'finish' && styles.activeButtonText,
                        { color: textColor },
                        (isUpdating || !isConnected) && styles.disabledText
                      ]}
                    >
                      Încheiere program
                    </ThemedText>
                  </TouchableOpacity>
                  
                  {isLandscape && (
                    <View style={styles.statusMessageContainerLandscape}>
                      {(activeScene === 'pornit' || activeScene === 'oprit') && (
                        <View style={styles.microphoneStatusContainer}>
                          <ThemedText style={[
                            styles.microphoneStatusText, 
                            { 
                              color: activeScene === 'pornit' ? '#4AFF50' : '#FF3A3A'
                            }
                          ]}>
                            Microfonul este {activeScene === 'pornit' ? 'PORNIT' : 'OPRIT'}
                          </ThemedText>
                        </View>
                      )}
                      
                      {activeScene === 'finish' && (
                        <View style={styles.reminderContainer}>
                          <ThemedText style={[styles.reminderText, { color: '#FF0000' }]}>
                            Nu uitați să opriți microfonul!
                          </ThemedText>
                        </View>
                      )}
                      
                      {!activeScene && (
                        <View style={styles.placeholderContainer}>
                          <ThemedText style={styles.placeholderText}>
                            Selectați o opțiune
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.statusMessageContainer}>
                {(activeScene === 'pornit' || activeScene === 'oprit') && !isLandscape && (
                  <View style={styles.microphoneStatusContainer}>
                    <ThemedText style={[
                      styles.microphoneStatusText, 
                      { 
                        color: activeScene === 'pornit' ? '#4AFF50' : '#FF3A3A'
                      }
                    ]}>
                      Microfonul este {activeScene === 'pornit' ? 'PORNIT' : 'OPRIT'}
                    </ThemedText>
                  </View>
                )}
                
                {activeScene === 'finish' && !isLandscape && (
                  <View style={styles.reminderContainer}>
                    <ThemedText style={[styles.reminderText, { color: '#FF0000' }]}>
                      Nu uitați să opriți microfonul!
                    </ThemedText>
                  </View>
                )}
                
                {!activeScene && !isLandscape && (
                  <View style={styles.placeholderContainer}>
                    <ThemedText style={styles.placeholderText}>
                      Selectați o opțiune
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
            </>
          )}
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
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  contentLandscape: {
    paddingHorizontal: 40,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mainControlsArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonsLayout: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsLayoutLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    paddingTop: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
    alignSelf: 'center',
    maxWidth: 420,
    width: '100%',
  },
  buttonContainerLandscape: {
    flexDirection: 'column',
    width: '50%',
    maxWidth: undefined,
  },
  rightContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  rightContainerLandscape: {
    width: '50%',
    maxWidth: undefined,
  },
  button: {
    flex: 1,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: 200,
    minWidth: 120,
    width: '100%',
  },
  fullWidthButton: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 30,
    width: '100%',
    maxWidth: 420,
  },
  buttonDark: {
    borderColor: '#666',
  },
  startButton: {
    borderColor: '#4AFF50',
    backgroundColor: 'rgba(74, 255, 80, 0.15)',
  },
  stopButton: {
    borderColor: '#FF3A3A',
    backgroundColor: 'rgba(255, 58, 58, 0.15)',
  },
  endButton: {
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
  },
  activeButton: {
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    marginTop: 10,
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
    height: 0,
    margin: 0,
  },
  initializingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  initializingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  microphoneStatusContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  microphoneStatusText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reminderContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  reminderText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FF0000',
  },
  buttonLandscape: {
    height: 140,
    minWidth: 140,
    maxWidth: '100%',
    width: '100%',
  },
  fullWidthButtonLandscape: {
    height: 100,
  },
  statusMessageContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  statusMessageContainerLandscape: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  placeholderContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.6,
  },
});
