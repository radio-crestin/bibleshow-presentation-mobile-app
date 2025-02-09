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
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down' | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: 'up' | 'down') => {
    setTransitionDirection(direction);
    slideAnim.setValue(direction === 'up' ? 300 : -300);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTransitionDirection(null);
    });
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
          transitionDirection && {
            transform: [{ translateY: slideAnim }]
          }
        ]}>
        <View style={styles.topSection}>
          <VerseSection
            verse={verses[0]}
            fontSize={fontSize}
            onPress={() => {
              if (ws && isConnected) {
                animateTransition('down');
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
                animateTransition('up');
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

