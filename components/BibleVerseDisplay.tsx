import { StyleSheet, View, Pressable } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { ThemedText } from './ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';
import { useRouter } from 'expo-router';

type BibleVerse = {
  text: string;
  reference: string;
};

type Props = {
  verses: BibleVerse[];
  currentBook: string;
};

export function BibleVerseDisplay({ verses, currentBook }: Props) {
  const insets = useSafeAreaInsets();
  const { fontSize } = useSettings();
  const router = useRouter();

  return (
    <View style={[styles.container, { 
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left + 16,
      paddingRight: insets.right + 16,
    }]}>
      <ThemedText style={styles.currentReference}>{currentBook} {verses[1].reference}</ThemedText>
      <Pressable 
        onPress={() => router.push('/settings')}
        style={styles.settingsButton}
      >
        <IconSymbol name="gear" size={24} />
      </Pressable>
      {verses.map((verse, index) => (
        <View
          key={verse.reference}
          style={[
            styles.verseContainer,
            index === 1 && styles.middleVerseContainer,
          ]}>
          <View style={[styles.verseContent, index === 1 && styles.highlightedVerse]}>
            <View style={styles.verseWrapper}>
              <ThemedText style={[styles.referenceText, { fontSize }]}>{verse.reference}</ThemedText>
              <ThemedText style={[styles.verseText, { fontSize }]}>{verse.text}</ThemedText>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  currentReference: {
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    top: 60,
    left: 16,
  },
  verseContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  verseContent: {
    padding: 16,
    borderRadius: 8,
    minHeight: 100,
  },
  verseWrapper: {
    width: '100%',
    flex: 1,
  },
  middleVerseContainer: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  highlightedVerse: {
    backgroundColor: '#FFA500',
  },
  verseText: {
    width: '100%',
    textAlign: 'left',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  referenceText: {
    fontWeight: 'bold',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    padding: 8,
  },
});
