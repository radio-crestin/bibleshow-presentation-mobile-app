import { View, Animated, useWindowDimensions, Text } from 'react-native';
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
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      paddingTop: isLandscape ? 20 : 0,
    }]}>
      <Header
        currentReference={verses.length === 1 ? verses[0].reference : verses[1].reference}
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        paddingTop={insets.top}
      />
      <View style={styles.versesContainer}>
        {verses.length === 1 ? (
            <View style={styles.topSection}>
              <VerseSection
                  verse={verses[0]}
                  fontSize={fontSize}
                  isHighlighted
                  onPress={() => {
                    if (ws && isConnected) {
                      ws.send(JSON.stringify({
                        type: 'setReference',
                        reference: verses[0].reference
                      }));
                    }
                  }}
              />
            </View>
        ) : (
            <>
              <View style={styles.topSection}>
                <VerseSection
                    verse={verses[0]}
                    fontSize={fontSize}
                    onPress={() => {
                      if (ws && isConnected) {
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
                        ws.send(JSON.stringify({
                          type: 'setReference',
                          reference: verses[2].reference
                        }));
                      }
                    }}
                />
              </View>


            </>
        )}
      </View>
    </View>
  );
}

