import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';

type BibleVerse = {
  text: string;
  reference: string;
};

type Props = {
  verses: BibleVerse[];
};

export function BibleVerseDisplay({ verses }: Props) {
  return (
    <View style={styles.container}>
      {verses.map((verse, index) => (
        <View
          key={verse.reference}
          style={[
            styles.verseContainer,
            index === 1 && styles.middleVerseContainer,
          ]}>
          {index === 1 ? (
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.gradient}>
              <ThemedText style={styles.verseText}>{verse.text}</ThemedText>
              <ThemedText style={styles.referenceText}>{verse.reference}</ThemedText>
            </LinearGradient>
          ) : (
            <>
              <ThemedText style={styles.verseText}>{verse.text}</ThemedText>
              <ThemedText style={styles.referenceText}>{verse.reference}</ThemedText>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  verseContainer: {
    marginVertical: 10,
    padding: 16,
    borderRadius: 8,
  },
  middleVerseContainer: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    padding: 16,
    borderRadius: 8,
  },
  verseText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  referenceText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'right',
  },
});
