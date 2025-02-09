import { StyleSheet, View } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { ThemedText } from './ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  return (
    <View style={[styles.container, { 
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left + 16,
      paddingRight: insets.right + 16,
    }]}>
      <ThemedText style={styles.currentReference}>{currentBook} {verses[1].reference}</ThemedText>
      {verses.map((verse, index) => (
        <View
          key={verse.reference}
          style={[
            styles.verseContainer,
            index === 1 && styles.middleVerseContainer,
          ]}>
          <View style={[
            styles.verseContent,
            index === 1 && styles.highlightedVerse
          ]}>
            <ThemedText style={[styles.referenceText, { fontSize }]}>{verse.reference}</ThemedText>
            <ThemedText style={[styles.verseText, { fontSize }]}>{verse.text}</ThemedText>
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
    top: 50,
    left: 16,
  },
  verseContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  verseContent: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
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
    flex: 1,
    textAlign: 'left',
    marginLeft: 16,
  },
  referenceText: {
    fontWeight: 'bold',
    width: 80,
  },
});
