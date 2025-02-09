import { View, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';
import { useRouter } from 'expo-router';

type HeaderProps = {
  currentBook: string;
  currentReference: string;
  isConnected: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  paddingTop: number;
};

export function Header({ 
  currentBook, 
  currentReference, 
  isConnected, 
  isRefreshing, 
  onRefresh,
  paddingTop 
}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <ThemedText style={styles.currentReference}>{currentBook} {currentReference}</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
        <Pressable 
          onPress={onRefresh}
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
  );
}
