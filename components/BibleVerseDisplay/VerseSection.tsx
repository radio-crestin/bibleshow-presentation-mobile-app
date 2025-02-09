import { View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { styles } from './styles';
import { BibleVerse } from './types';
import { useState, useEffect } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import { WebView } from 'react-native-webview';
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

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        <WebView
          style={[styles.webview, { height: fontSize * numberOfLines * 1.5 }]}
          source={{
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      font-size: ${fontSize}px;
                      color: ${isDark ? '#fff' : '#000'};
                      background-color: ${isDark ? '#000' : '#fff'};
                      font-family: system-ui;
                    }
                    .Isus {
                      color: #ff0000;
                    }
                  </style>
                </head>
                <body>
                  ${currentVerse.text}
                </body>
              </html>
            `
          }}
          scrollEnabled={false}
          originWhitelist={['*']}
          bounces={false}
        />
      </View>
    </Pressable>
  );
}
