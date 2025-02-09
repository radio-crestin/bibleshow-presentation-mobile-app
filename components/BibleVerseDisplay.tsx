import { StyleSheet, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';
import { ThemedText } from './ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';
import { useRouter } from 'expo-router';

type BibleVerse = {
  text: string;
  reference: string;
};

type Props = {
  verses: BibleVerse[];
  currentBook: string;
};

export function BibleVerseDisplay({ verses, currentBook }: Props) {
  const insets = useSafeAreaInsets();
  const { fontSize, isConnected, ws } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (ws && isConnected) {
      setIsRefreshing(true);
      ws.send(JSON.stringify({ type: 'refresh' }));
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };
  const router = useRouter();

  return (
    <View style={[styles.container, {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.currentReference}>{currentBook} {verses[1].reference}</ThemedText>
        </View>
        <View style={{ flex: 2, alignItems: 'center' }}>
          <View style={styles.connectionStatus}>
            <ThemedText style={styles.connectionText}>
              {isConnected ? 'Conectat' : 'Deconectat'}
            </ThemedText>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Pressable 
            onPress={handleRefresh}
            style={[styles.iconButton, isRefreshing && styles.rotating]}
          >
            <IconSymbol name="arrow.clockwise" size={24} />
          </Pressable>
          <Pressable 
            onPress={() => router.push('/settings')}
            style={styles.iconButton}
          >
            <IconSymbol name="gear" size={24} />
          </Pressable>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {verses.map((verse, index) => (
          <View
            key={`verse-${index}`}
            style={[
              styles.verseContainer,
              index === 1 && styles.middleVerseContainer,
            ]}>
          <Pressable 
            onPress={() => {
              if (ws && isConnected) {
                ws.send(JSON.stringify({
                  type: 'setReference',
                  reference: verse.reference
                }));
              }
            }}
            style={[
              styles.verseContent, 
              index === 1 && styles.highlightedVerse,
              { minHeight: Math.max(80, fontSize * 3) }
            ]}
          >
            <View style={styles.verseWrapper}>
              <ThemedText style={[styles.referenceText, { fontSize }]}>{verse.reference}</ThemedText>
              <ThemedText style={[styles.verseText, { fontSize }]}>{verse.text}</ThemedText>
            </View>
          </View>
        </View>
      ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionText: {
    fontSize: 14,
    color: '#666',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentReference: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContentContainer: {
    paddingVertical: 16,
  },
  verseContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
  verseContent: {
    padding: 16,
    borderRadius: 8,
    minHeight: 80,
  },
  verseWrapper: {
    width: '100%',
  },
  middleVerseContainer: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  highlightedVerse: {
    backgroundColor: '#FFA500',
  },
  verseText: {
    width: '100%',
    textAlign: 'left',
    marginTop: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  referenceText: {
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  rotating: {
    opacity: 0.5,
  },
});
