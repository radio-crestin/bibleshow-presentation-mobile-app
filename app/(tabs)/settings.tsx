import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettings } from '@/contexts/SettingsContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { fontSize, increaseFontSize, decreaseFontSize } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <Pressable 
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <IconSymbol name="xmark.circle.fill" size={28} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="textformat.size" size={24} />
            <ThemedText style={styles.sectionTitle}>Font Size</ThemedText>
          </View>
          
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
          <View style={[styles.previewContainer, { minHeight: fontSize * 4 }]}>
            <ThemedText style={[styles.previewText, { fontSize }]}>
              The quick brown fox jumps over the lazy dog
            </ThemedText>
          </View>
        </View>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  previewText: {
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});
