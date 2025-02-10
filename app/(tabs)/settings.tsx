import { StyleSheet, View, Pressable, TextInput, ScrollView, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettings } from '@/contexts/SettingsContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { 
    fontSize, 
    increaseFontSize, 
    decreaseFontSize, 
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
    setColorScheme
  } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Setări</ThemedText>
        <Pressable 
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <IconSymbol name="xmark.circle.fill" size={28} color={''} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="moon.fill" size={24} color={''} />
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
            <IconSymbol name="textformat.size" size={24} color={''} />
            <ThemedText style={styles.sectionTitle}>Mărime Text</ThemedText>
          </View>
          
          <View style={styles.fontSizeControl}>
            <Pressable 
              onPress={decreaseFontSize}
              style={styles.button}
            >
              <IconSymbol name="minus.circle.fill" size={32} color={''} />
            </Pressable>
            <ThemedText style={styles.fontSize}>{fontSize}</ThemedText>
            <Pressable 
              onPress={increaseFontSize}
              style={styles.button}
            >
              <IconSymbol name="plus.circle.fill" size={32} color={''} />
            </Pressable>
          </View>
          <View style={[styles.previewContainer, { minHeight: fontSize * 4 }]}>
            <ThemedText style={[styles.previewText, { fontSize }]}>
              The quick brown fox jumps over the lazy dog
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="network" size={24} color={''} />
            <ThemedText style={styles.sectionTitle}>Conexiune Server</ThemedText>
          </View>
          
          <View style={styles.wsUrlContainer}>
            <ThemedText style={styles.wsUrlLabel}>Adresă server:</ThemedText>
            <TextInput
              style={styles.wsUrlInput}
              value={wsUrl}
              onChangeText={setWsUrl}
              placeholder="ws://localhost:3000"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="powersleep" size={24} color={''} />
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
                  const number = parseInt(text) || 1;
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
            <IconSymbol name="clock" size={24} color={''} />
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
                      <IconSymbol name="minus.circle.fill" size={32} color={''} />
                    </Pressable>
                    <ThemedText style={styles.fontSize}>{clockSize}</ThemedText>
                    <Pressable 
                      onPress={() => setClockSize(Math.min(72, clockSize + 2))}
                      style={styles.button}
                    >
                      <IconSymbol name="plus.circle.fill" size={32} color={''} />
                    </Pressable>
                  </View>
                  <View style={[styles.previewContainer, { minHeight: clockSize * 1.5 }]}>
                    <ThemedText style={[styles.previewText, { fontSize: clockSize }]}>
                      {showSeconds ? '12:34:56' : '12:34'}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
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
  fontSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 8,
    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
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
  previewContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  previewText: {
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  wsUrlContainer: {
    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
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
  },
  powerSaveContainer: {
    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
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
  disconnectedMessage: {
    alignItems: 'center',
    padding: 20,
  },
  clockSizeContainer: {
    marginTop: 16,
  },
  clockSizeLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
});
