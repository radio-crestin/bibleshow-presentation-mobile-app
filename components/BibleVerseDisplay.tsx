import {View, Animated, useWindowDimensions, Text, ScrollView} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BibleVerseDisplayProps } from './BibleVerseDisplay/types';
import { styles } from './BibleVerseDisplay/styles';
import { Header } from './BibleVerseDisplay/Header';
import { VerseSection } from './BibleVerseDisplay/VerseSection';
import { SkeletonLoader } from './BibleVerseDisplay/SkeletonLoader';
import {ThemedText} from "@/components/ThemedText";

export function BibleVerseDisplay({ verses, currentVerse }: BibleVerseDisplayProps) {
  const insets = useSafeAreaInsets();
  const { fontSize, isConnected, ws, colorScheme } = useSettings();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const verseMeasurements = useRef<{ [key: string]: number }>({});
  const scrollViewRef = useRef<ScrollView>(null);

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
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5'
    }]}>
      <Header
        currentReference={currentVerse?.reference || ''}
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
      <View style={styles.versesContainer}>
        {!isConnected ? (
          <View style={styles.topSection}>
            <SkeletonLoader numberOfLines={4} fontSize={fontSize} />
          </View>
        ) : (
          <Animated.ScrollView 
            ref={scrollViewRef}
            style={styles.versesList}
            contentContainerStyle={{
              paddingTop: height / 2 - 50,
              paddingBottom: height / 2 - 50,
            }}
          >
            {verses.map((verse) => (
              <View 
                key={verse.reference}
                style={[
                  styles.verseSection,
                  verse.reference === currentVerse?.reference && styles.currentVerseSection
                ]}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  verseMeasurements.current[verse.reference] = height;
                  
                  if (verse.reference === currentVerse?.reference && scrollViewRef.current) {
                    let totalHeight = 0;
                    for (const v of verses) {
                      if (v.reference === currentVerse.reference) break;
                      totalHeight += verseMeasurements.current[v.reference] || 0;
                    }
                    scrollViewRef.current.scrollTo({ 
                      y: totalHeight + (isLandscape ? 250 : 350),
                      animated: true 
                    });
                  }
                }}
              >
                <VerseSection
                  verse={verse}
                  fontSize={fontSize}
                  isHighlighted={verse.reference === currentVerse?.reference}
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
            ))}
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

