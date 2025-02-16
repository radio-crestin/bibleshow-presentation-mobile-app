import {View, Animated, useWindowDimensions, Text, ScrollView, Pressable, Button, NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import { router } from 'expo-router';
import {useKeepAwake} from 'expo-keep-awake';
import { useSettings } from '@/contexts/SettingsContext';
import {useState, useRef, useEffect} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BibleVerseDisplayProps } from './BibleVerseDisplay/types';
import { styles } from './BibleVerseDisplay/styles';
import { Header } from './BibleVerseDisplay/Header';
import { VerseSection } from './BibleVerseDisplay/VerseSection';

export function BibleVerseDisplay({ verses: initialVerses, currentVerse }: BibleVerseDisplayProps) {
  useKeepAwake();

  const insets = useSafeAreaInsets();
  const { normalFontSize, highlightedFontSize, highlightedTextBold, isConnected, ws, colorScheme, normalVerseBackgroundColor, reConnectWebSocket } = useSettings();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const verseMeasurements = useRef<{ [key: string]: number }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollInfo = useRef<{ 
    offsetY: number,
    layoutHeight: number,
    contentHeight: number,
    visibleTop: number,
    visibleBottom: number,
    x: number, 
    y: number 
  }>({
    offsetY: 0,
    layoutHeight: 0,
    contentHeight: 0,
    visibleTop: 0,
    visibleBottom: 0,
    x: 0,
    y: 0
  });
  const totalHeightRef = useRef(0);
  const verseBottomRef = useRef(0);

  const scrollToCurrentVerse = () => {
    if (currentVerse && scrollViewRef.current) {
      let totalHeightOfPreviousVerses = 0;
      let allMeasurementsReady = true;
      let currentVerseHeight = 0;

      // Calculate total height up to current verse and get current verse height
      for (const v of verses) {
        if (!verseMeasurements.current[v.reference]) {
          allMeasurementsReady = false;
          break;
        }
        if (v.reference === currentVerse.reference) {
          currentVerseHeight = verseMeasurements.current[v.reference];
          break;
        }
        totalHeightOfPreviousVerses += verseMeasurements.current[v.reference];
      }

      if (allMeasurementsReady && scrollViewRef.current) {
        totalHeightRef.current = totalHeightOfPreviousVerses;
        verseBottomRef.current = totalHeightOfPreviousVerses + currentVerseHeight;

        const targetScrollPosition = Math.max(0, totalHeightOfPreviousVerses);

        // Calculate distances from verse edges to viewport edges
        if (scrollViewRef.current) {
          const scrollView = scrollViewRef.current;
          const offsetY = scrollView.getScrollableNode().scrollTop || 0;
          const layoutHeight = scrollView.getScrollableNode().clientHeight || 0;
          
          const verseTop = totalHeightOfPreviousVerses;
          const verseBottom = totalHeightOfPreviousVerses + currentVerseHeight;
          
          const visibleTop = offsetY - height / 2;
          const visibleBottom = offsetY + layoutHeight - height / 2;
          
          const distanceToTop = verseTop - visibleTop;
          const distanceToBottom = visibleBottom - verseBottom;

          const isVerseVisible = distanceToTop >= 0 && distanceToBottom >= 0;
        }
        console.log({
          totalHeight: totalHeightOfPreviousVerses,
          currentVerseHeight,
            distanceToTop,
            distanceToBottom,
            isVerseVisible,
          scrollInfo: scrollInfo.current,
          verseTop,
            verseBottom,
        })

        if (!isVerseVisible) {

          scrollViewRef.current?.scrollTo({
            y: targetScrollPosition,
            animated: true
          });
        }
      }
    }
  };

  useEffect(() => {
    if (currentVerse) {
      scrollToCurrentVerse();
    }
  }, [currentVerse?.reference]);

  // Helper function to extract chapter and verse numbers
  const parseReference = (reference: string) => {
    const match = reference.match(/(\d+):(\d+)/);
    if (match) {
      return {
        chapter: parseInt(match[1], 10),
        verse: parseInt(match[2], 10)
      };
    }
    return { chapter: 0, verse: 0 };
  };

  // Process verses to include currentVerse, remove duplicates, and sort
  const verses = [...(currentVerse
    ? [
        ...initialVerses.filter(v => v.reference !== currentVerse.reference),
        currentVerse
      ]
    : initialVerses)].sort((a, b) => {
      const verseA = parseReference(a.reference);
      const verseB = parseReference(b.reference);

      if (verseA.chapter !== verseB.chapter) {
        return verseA.chapter - verseB.chapter;
      }
      return verseA.verse - verseB.verse;
    });

  const handleRefresh = () => {
    setIsRefreshing(true);
    reConnectWebSocket();
    setIsRefreshing(false);
  };
  return (
    <View style={[styles.container, {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingTop: isLandscape ? 20 : 0,
      backgroundColor: normalVerseBackgroundColor
    }]}>
      <Header
        currentReference={currentVerse?.reference || ''}
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
      <View style={styles.versesContainer}>
        {isConnected && (
          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.versesList}
            onLayout={(event) => {
              const { x, y } = event.nativeEvent.layout;
              scrollInfo.current = {
                ...scrollInfo.current,
                x,
                y
              };
            }}
            scrollEventThrottle={16}
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
                  verseMeasurements.current[verse.reference] = height + styles.verseSection.marginBottom;

                  if (verse.reference === currentVerse?.reference) {
                    scrollToCurrentVerse();
                  }
                }}
              >
                <VerseSection
                  verse={verse}
                  fontSize={verse.reference === currentVerse?.reference ? highlightedFontSize : normalFontSize}
                  isHighlighted={verse.reference === currentVerse?.reference}
                  colorScheme={colorScheme}
                  bold={verse.reference === currentVerse?.reference && highlightedTextBold}
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
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20
        }}>
          <Text style={{ color: '#888888', fontSize: 16 }}>Deconectat de la server</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              backgroundColor: colorScheme === 'dark' ? '#333' : '#ddd',
              padding: 10,
              borderRadius: 8
            })}
          >
            <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>Deschide Setările</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

