import { View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { styles } from './styles';
import { BibleVerse } from './types';

type VerseSectionProps = {
  verse: BibleVerse;
  fontSize: number;
  isHighlighted?: boolean;
  onPress: () => void;
};

export function VerseSection({ verse, fontSize, isHighlighted, onPress }: VerseSectionProps) {
  return (
    <Pressable 
      onPress={onPress}
      style={[
        styles.verseContent,
        isHighlighted && styles.highlightedVerse,
        { minHeight: Math.max(80, fontSize * 3) }
      ]}
    >
      <View style={styles.verseWrapper}>
        <ThemedText style={[styles.referenceText, { fontSize }]}>{verse.reference}</ThemedText>
        <ThemedText style={[styles.verseText, { fontSize }]}>{verse.text}</ThemedText>
      </View>
    </Pressable>
  );
}
