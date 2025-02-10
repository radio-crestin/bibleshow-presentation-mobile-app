import { View, Animated, useWindowDimensions, Text } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BibleVerseDisplayProps } from './BibleVerseDisplay/types';
import { styles } from './BibleVerseDisplay/styles';
import { Header } from './BibleVerseDisplay/Header';
import { VerseSection } from './BibleVerseDisplay/VerseSection';
import { SkeletonLoader } from './BibleVerseDisplay/SkeletonLoader';

export function BibleVerseDisplay({ verses, currentVerse }: BibleVerseDisplayProps) {
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
        currentReference={currentVerse?.reference || ''}
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        paddingTop={insets.top}
      />
      <View style={styles.versesContainer}>
        {!isConnected ? (
          <View style={styles.topSection}>
            <SkeletonLoader numberOfLines={4} fontSize={fontSize} />
          </View>
        ) : (
          <Animated.ScrollView 
            style={styles.versesList}
            contentContainerStyle={{ paddingTop: 200 }}
          >
            {verses.map((verse, index) => {
              const isCurrentVerse = verse.reference === currentVerse?.reference;
              return isCurrentVerse ? (
                <View 
                  key={verse.reference}
                  style={[
                    styles.verseSection,
                    styles.currentVerseSection,
                    { position: 'absolute', top: 200, left: 0, right: 0, zIndex: 1 }
                  ]}
                >
                  <VerseSection
                    verse={verse}
                    fontSize={fontSize}
                    isHighlighted={true}
                    onPress={() => {
                      if (ws && isConnected) {
                        ws.send(JSON.stringify({
                          type: 'setReference',
                          reference: verse.reference
                        }));
                      }
                    }}
                  />
                </View>
              ) : (
                <View 
                  key={verse.reference} 
                  style={styles.verseSection}
                >
                  <VerseSection
                    verse={verse}
                    fontSize={fontSize}
                    isHighlighted={false}
                    onPress={() => {
                      if (ws && isConnected) {
                        ws.send(JSON.stringify({
                          type: 'setReference',
                          reference: verse.reference
                        }));
                      }
                    }}
                  />
                </View>
              );
            })}
          </Animated.ScrollView>
        )}
      </View>
      {!isConnected && (
        <View style={{ 
          position: 'absolute', 
          bottom: insets.bottom + 10, 
          left: 0, 
          right: 0, 
          alignItems: 'center' 
        }}>
          <Text style={{ color: '#888888', fontSize: 16 }}>Disconnected from server</Text>
        </View>
      )}
    </View>
  );
}

