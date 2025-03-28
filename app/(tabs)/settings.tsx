import { StyleSheet, View, Pressable, TextInput, ScrollView, Switch, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { VerseSection } from '@/components/BibleVerseDisplay/VerseSection';
import { ColorPickerDialog } from '@/components/ColorPickerDialog';
import { ColorPreview } from '@/components/ColorPreview';
import { FontSizeControl } from '@/components/FontSizeControl';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettings, UsageMode, USAGE_MODE_LABELS } from '@/contexts/SettingsContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import {useState, useEffect, useRef} from "react";
import ColorPicker from "react-native-wheel-color-picker";

export default function SettingsScreen() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [activeColorPicker, setActiveColorPicker] = useState<{
    type: 'clock' | 'normalBackground' | 'normalText' | 'highlightBackground' | 'highlightText' | null;
    title: string;
    color: string;
    onSelect: (color: string) => void;
  } | null>(null);
  const [tempWsUrl, setTempWsUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { 
    normalFontSize,
    increaseNormalFontSize,
    decreaseNormalFontSize,
    highlightedFontSize,
    increaseHighlightedFontSize,
    decreaseHighlightedFontSize,
    wsUrl, 
    setWsUrl,
    powerSaveEnabled,
    setPowerSaveEnabled,
    powerSaveTimeout,
    setPowerSaveTimeout,
    testPowerSave,
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
    usageMode,
    setUsageMode,
  } = useSettings();
  const router = useRouter();
  
  // Initialize tempWsUrl with the current wsUrl when component mounts
  useEffect(() => {
    setTempWsUrl(wsUrl);
  }, [wsUrl]);
  
  // Function to validate WebSocket URL
  const validateWsUrl = (url: string): { isValid: boolean; message?: string } => {
    // Check if URL is empty
    if (!url.trim()) {
      return { isValid: false, message: 'Adresa serverului nu poate fi goală' };
    }
    
    // Check if URL starts with ws:// or wss://
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      return { isValid: false, message: 'Adresa trebuie să înceapă cu ws:// sau wss://' };
    }
    
    try {
      // Parse the URL to validate its format
      const parsedUrl = new URL(url);
      
      // Check if port is specified and is a valid number
      if (parsedUrl.port && !/^\d+$/.test(parsedUrl.port)) {
        return { isValid: false, message: 'Portul trebuie să fie un număr' };
      }
      
      // Check if port is in valid range (1-65535)
      if (parsedUrl.port && (parseInt(parsedUrl.port) < 1 || parseInt(parsedUrl.port) > 65535)) {
        return { isValid: false, message: 'Portul trebuie să fie între 1 și 65535' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Format URL invalid' };
    }
  };
  
  // Function to test connection to WebSocket server
  const testConnection = async () => {
    // Validate the URL first
    const validation = validateWsUrl(tempWsUrl);
    if (!validation.isValid) {
      Alert.alert('Eroare', validation.message || 'URL invalid');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Create a new WebSocket connection
      const testWs = new WebSocket(tempWsUrl);
      
      // Set up a timeout to abort connection attempt after 5 seconds
      const connectionTimeout = setTimeout(() => {
        testWs.close();
        setIsConnecting(false);
        Alert.alert('Eroare', 'Conexiunea a expirat. Verificați adresa și asigurați-vă că serverul rulează.');
      }, 5000);
      
      // Handle successful connection
      testWs.onopen = () => {
        clearTimeout(connectionTimeout);
        testWs.close();
        setIsConnecting(false);
        
        // Save the new URL
        setWsUrl(tempWsUrl);
        Alert.alert('Succes', 'Conexiune stabilită cu succes. Noua adresă a fost salvată.');
      };
      
      // Handle connection error
      testWs.onerror = (error) => {
        clearTimeout(connectionTimeout);
        setIsConnecting(false);
        Alert.alert('Eroare', 'Nu s-a putut conecta la server. Verificați adresa și asigurați-vă că serverul rulează.');
      };
    } catch (error) {
      setIsConnecting(false);
      Alert.alert('Eroare', `Eroare la conectare: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
    }
  };
  
  // Apply custom styling to the web select element
  useEffect(() => {
    if (Platform.OS === 'web' && selectRef.current) {
      // Get all option elements
      const options = selectRef.current.querySelectorAll('option');
      
      // Apply styling to each option
      options.forEach(option => {
        if (option.value === usageMode) {
          option.style.fontWeight = 'bold';
        } else {
          option.style.fontWeight = 'normal';
        }
        option.style.color = colorScheme === 'dark' ? 'white' : 'black';
      });
    }
  }, [usageMode, colorScheme]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Setări",
          headerShown: true,
          headerRight: () => (
            <Pressable 
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 8 })}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </Pressable>
          ),
        }} 
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="gearshape.2" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Mod utilizare</ThemedText>
          </View>
          
          <View style={styles.usageModeContainer}>
            <ThemedText style={styles.usageModeLabel}>Selectează modul de utilizare:</ThemedText>
            <View style={styles.nativeOptionsContainer}>
              {Object.entries(USAGE_MODE_LABELS).map(([value, label]) => (
                  <TouchableOpacity
                      key={value}
                      style={[
                        styles.optionButton,
                        usageMode === value && styles.selectedOptionButton,
                        colorScheme === 'dark' && styles.optionButtonDark,
                        usageMode === value && colorScheme === 'dark' && styles.selectedOptionButtonDark
                      ]}
                      onPress={() => setUsageMode(value as UsageMode)}
                  >
                    <ThemedText
                        style={[
                          styles.optionText,
                          usageMode === value && styles.selectedOptionText,
                          colorScheme === 'dark' && styles.optionTextDark
                        ]}
                    >
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="moon.fill" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Aspect</ThemedText>
          </View>
          
          <View style={styles.powerSaveContainer}>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Mod întunecat</ThemedText>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={(enabled) => setColorScheme(enabled ? 'dark' : 'light')}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="network" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Conexiune Server</ThemedText>
          </View>
          
          <View style={styles.wsUrlContainer}>
            <ThemedText style={styles.wsUrlLabel}>Adresă server:</ThemedText>
            <TextInput
              style={styles.wsUrlInput}
              value={tempWsUrl}
              onChangeText={setTempWsUrl}
              placeholder="ws://localhost:3000"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.urlValidationContainer}>
              {tempWsUrl.trim() !== '' && (
                <ThemedText style={[
                  styles.validationText,
                  validateWsUrl(tempWsUrl).isValid ? styles.validText : styles.invalidText
                ]}>
                  {validateWsUrl(tempWsUrl).isValid 
                    ? '✓ Format URL valid' 
                    : `✗ ${validateWsUrl(tempWsUrl).message}`}
                </ThemedText>
              )}
            </View>
            <Pressable
              onPress={testConnection}
              style={[
                styles.connectButton,
                isConnecting && styles.connectingButton,
                !validateWsUrl(tempWsUrl).isValid && styles.disabledButton
              ]}
              disabled={isConnecting || !validateWsUrl(tempWsUrl).isValid}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <ThemedText style={styles.connectButtonText}>Se conectează...</ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.connectButtonText}>
                  Conectare și salvare
                </ThemedText>
              )}
            </Pressable>
            <ThemedText style={styles.currentConnectionText}>
              Adresă curentă: {wsUrl}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="powersleep" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Economisire Energie</ThemedText>
          </View>
          
          <View style={styles.powerSaveContainer}>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Activează economisire energie</ThemedText>
              <Switch
                value={powerSaveEnabled}
                onValueChange={setPowerSaveEnabled}
              />
            </View>
            
            <View style={styles.timeoutContainer}>
              <ThemedText style={styles.timeoutLabel}>Timp până la stingere (minute):</ThemedText>
              <TextInput
                style={styles.timeoutInput}
                value={powerSaveTimeout.toString()}
                onChangeText={(text) => {
                  const number = parseFloat(text) || 1;
                  setPowerSaveTimeout(Math.max(1, number));
                }}
                keyboardType="number-pad"
                editable={powerSaveEnabled}
              />
            </View>
            
            {powerSaveEnabled && (
              <Pressable
                onPress={testPowerSave}
                style={styles.testButton}
              >
                <ThemedText style={styles.testButtonText}>Testează economisire energie</ThemedText>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="clock" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Afișare Ceas</ThemedText>
          </View>
          
          <View style={styles.powerSaveContainer}>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Arată ceas</ThemedText>
              <Switch
                value={showClock}
                onValueChange={setShowClock}
              />
            </View>
            {showClock && (
              <>
                <View style={styles.switchRow}>
                  <ThemedText style={styles.switchLabel}>Arată secunde</ThemedText>
                  <Switch
                    value={showSeconds}
                    onValueChange={setShowSeconds}
                  />
                </View>
                <View style={styles.clockSizeContainer}>
                  <ThemedText style={styles.clockSizeLabel}>Mărime ceas:</ThemedText>
                  <View style={styles.fontSizeControl}>
                    <Pressable 
                      onPress={() => setClockSize(Math.max(16, clockSize - 2))}
                      style={styles.button}
                    >
                      <IconSymbol name="minus.circle.fill" size={32} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    </Pressable>
                    <ThemedText style={styles.fontSize}>{clockSize}</ThemedText>
                    <Pressable 
                      onPress={() => setClockSize(Math.min(72, clockSize + 2))}
                      style={styles.button}
                    >
                      <IconSymbol name="plus.circle.fill" size={32} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    </Pressable>
                  </View>
                  <View style={styles.colorSettingsContainer}>
                    <View style={styles.colorSection}>
                      <ColorPreview
                        color={clockColor}
                        label="Culoare ceas"
                        onPress={() => setActiveColorPicker({
                          type: 'clock',
                          title: 'Culoare ceas',
                          color: clockColor,
                          onSelect: setClockColor
                        })}
                      />
                    </View>
                  </View>
                  <View style={[styles.previewContainer, { minHeight: clockSize * 1.5 }]}>
                    <ThemedText style={[styles.previewText, { fontSize: clockSize, color: clockColor }]}>
                      {showSeconds ? '12:34:56' : '12:34'}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="text.alignleft" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Versete normale</ThemedText>
          </View>
          
          <View style={styles.settingsSection}>
            <FontSizeControl
              label="Mărime text normal:"
              value={normalFontSize}
              onDecrease={decreaseNormalFontSize}
              onIncrease={increaseNormalFontSize}
            />
            <ColorPreview
              color={normalVerseBackgroundColor}
              label="Background versete"
              onPress={() => setActiveColorPicker({
                type: 'normalBackground',
                title: 'Background versete',
                color: normalVerseBackgroundColor,
                onSelect: setNormalVerseBackgroundColor
              })}
            />
            <ColorPreview
              color={normalVerseTextColor}
              label="Culoare text"
              onPress={() => setActiveColorPicker({
                type: 'normalText',
                title: 'Culoare text',
                color: normalVerseTextColor,
                onSelect: setNormalVerseTextColor
              })}
            />
            <View style={styles.previewContainer}>
              <VerseSection
                verse={{
                  reference: "Ioan 3:16",
                  text: "Fiindcă atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu..."
                }}
                fontSize={normalFontSize}
                isHighlighted={false}
                onPress={() => {}}
                colorScheme={colorScheme}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="text.badge.checkmark" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText style={styles.sectionTitle}>Verset evidențiat</ThemedText>
          </View>
          
          <View style={styles.settingsSection}>
            <FontSizeControl
              label="Mărime text evidențiat:"
              value={highlightedFontSize}
              onDecrease={decreaseHighlightedFontSize}
              onIncrease={increaseHighlightedFontSize}
            />
            <ColorPreview
              color={highlightColor}
              label="Background verset evidențiat"
              onPress={() => setActiveColorPicker({
                type: 'highlightBackground',
                title: 'Background verset evidențiat',
                color: highlightColor,
                onSelect: setHighlightColor
              })}
            />
            <ColorPreview
              color={verseTextColor}
              label="Culoare text"
              onPress={() => setActiveColorPicker({
                type: 'highlightText',
                title: 'Culoare text',
                color: verseTextColor,
                onSelect: setVerseTextColor
              })}
            />
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Text îngroșat</ThemedText>
              <Switch
                  value={highlightedTextBold}
                  onValueChange={setHighlightedTextBold}
              />
            </View>
            <View style={styles.previewContainer}>
              <VerseSection
                verse={{
                  reference: "Ioan 3:16",
                  text: "Fiindcă atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu..."
                }}
                fontSize={highlightedFontSize}
                isHighlighted={true}
                onPress={() => {}}
                colorScheme={colorScheme}
                bold={highlightedTextBold}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <ColorPickerDialog
        visible={activeColorPicker !== null}
        onClose={() => setActiveColorPicker(null)}
        onColorSelected={(color) => {
          if (activeColorPicker) {
            activeColorPicker.onSelect(color);
            setActiveColorPicker(null);
          }
        }}
        initialColor={activeColorPicker?.color || '#000000'}
        title={activeColorPicker?.title || ''}
      />

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  usageModeContainer: {
    borderRadius: 12,
    padding: 16,
  },
  usageModeLabel: {
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 16,
  },
  nativeOptionsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  selectedOptionButton: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionButtonDark: {
    backgroundColor: '#333',
    borderColor: '#666',
  },
  selectedOptionButtonDark: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  optionTextDark: {
    color: '#fff',
  },
  selectedOptionText: {
    fontWeight: '700',
  },
  selectContainer: {
    width: '100%',
  },
  webSelect: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    color: 'black',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  previewText: {
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  wsUrlContainer: {
    borderRadius: 12,
    padding: 16,
  },
  wsUrlLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  wsUrlInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  connectingButton: {
    backgroundColor: '#999999',
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  currentConnectionText: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
  },
  urlValidationContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  validationText: {
    fontSize: 14,
  },
  validText: {
    color: '#4CAF50',
  },
  invalidText: {
    color: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  powerSaveContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    fontWeight: '600',
  },
  timeoutContainer: {
    opacity: 0.8,
  },
  timeoutLabel: {
    marginBottom: 8,
  },
  timeoutInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disconnectedMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disconnectedText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  clockSizeContainer: {
    marginTop: 16,
  },
  clockSizeLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  colorSettingsContainer: {
    marginTop: 16,
    gap: 24,
  },
  settingsSection: {
    gap: 16,
  },
  fontSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 8,
    borderRadius: 12,
  },
  fontSize: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  button: {
    padding: 8,
  },
  colorSection: {
    gap: 8,
  },
});
