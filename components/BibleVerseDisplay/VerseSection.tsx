import { View, Pressable, useWindowDimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { styles } from './styles';
import { BibleVerse } from './types';
import { useState, useEffect } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import RenderHtml from 'react-native-render-html';
import { useColorScheme } from '@/hooks/useColorScheme';

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

  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

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
        <RenderHtml
          contentWidth={width}
          source={{ html: currentVerse.html || currentVerse.text }}
          tagsStyles={{
            p: {
              fontSize,
              color: textColor,
              margin: 0,
              padding: 0
            },
            span: {
              fontSize
            },
            '.Isus': {
              color: '#ff0000'
            }
          }}
        />
      </View>
    </Pressable>
  );
}
