import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettings } from '@/contexts/SettingsContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Pressable } from 'react-native';

export default function SettingsScreen() {
  const { fontSize, increaseFontSize, decreaseFontSize } = useSettings();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Font Size</ThemedText>
        <View style={styles.fontSizeControl}>
          <Pressable 
            onPress={decreaseFontSize}
            style={styles.button}
          >
            <IconSymbol name="minus.circle.fill" size={32} />
          </Pressable>
          <ThemedText style={styles.fontSize}>{fontSize}</ThemedText>
          <Pressable 
            onPress={increaseFontSize}
            style={styles.button}
          >
            <IconSymbol name="plus.circle.fill" size={32} />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fontSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  fontSize: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  button: {
    padding: 8,
  },
});
