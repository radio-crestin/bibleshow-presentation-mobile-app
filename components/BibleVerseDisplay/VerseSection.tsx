import { View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { styles } from './styles';
import { BibleVerse } from './types';
import { useState, useEffect } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

type VerseSectionProps = {
  verse: BibleVerse;
  fontSize: number;
  isHighlighted?: boolean;
  onPress: () => void;
};

export function VerseSection({ verse, fontSize, isHighlighted, onPress }: VerseSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(verse);
  const numberOfLines = Math.ceil(verse.text.length / 40); // Rough estimate of lines based on text length

  useEffect(() => {
    if (verse.text !== currentVerse.text || verse.reference !== currentVerse.reference) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setCurrentVerse(verse);
        setIsLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [verse.text, verse.reference]);

  if (isLoading) {
    return <SkeletonLoader numberOfLines={numberOfLines} fontSize={fontSize} />;
  }

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
        <ThemedText style={[styles.referenceText, { fontSize }]}>{currentVerse.reference}</ThemedText>
        <ThemedText style={[styles.verseText, { fontSize }]}>{currentVerse.text}</ThemedText>
      </View>
    </Pressable>
  );
}
