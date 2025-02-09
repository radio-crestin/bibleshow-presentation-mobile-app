import { View, Animated } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BibleVerseDisplayProps } from './BibleVerseDisplay/types';
import { styles } from './BibleVerseDisplay/styles';
import { Header } from './BibleVerseDisplay/Header';
import { VerseSection } from './BibleVerseDisplay/VerseSection';

export function BibleVerseDisplay({ verses, currentBook }: BibleVerseDisplayProps) {
  const insets = useSafeAreaInsets();
  const { fontSize, isConnected, ws } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleRefresh = () => {
    if (ws && isConnected) {
      setIsRefreshing(true);
      ws.send(JSON.stringify({ type: 'refresh' }));
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };
  return (
    <View style={[styles.container, {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <Header 
        currentBook={currentBook}
        currentReference={verses[1].reference}
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        paddingTop={insets.top}
      />
      <Animated.View 
        style={[
          styles.versesContainer,
          {
            opacity: fadeAnim
          }
        ]}>
        <View style={styles.topSection}>
          <VerseSection
            verse={verses[0]}
            fontSize={fontSize}
            onPress={() => {
              if (ws && isConnected) {
                animateTransition();
                ws.send(JSON.stringify({
                  type: 'setReference',
                  reference: verses[0].reference
                }));
              }
            }}
          />
        </View>

        <View style={styles.middleSection}>
          <VerseSection
            verse={verses[1]}
            fontSize={fontSize}
            isHighlighted
            onPress={() => {
              if (ws && isConnected) {
                ws.send(JSON.stringify({
                  type: 'setReference',
                  reference: verses[1].reference
                }));
              }
            }}
          />
        </View>

        <View style={styles.bottomSection}>
          <VerseSection
            verse={verses[2]}
            fontSize={fontSize}
            onPress={() => {
              if (ws && isConnected) {
                animateTransition();
                ws.send(JSON.stringify({
                  type: 'setReference',
                  reference: verses[2].reference
                }));
              }
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

