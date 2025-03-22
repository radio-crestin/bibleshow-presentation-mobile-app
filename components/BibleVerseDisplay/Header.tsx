import { View, Pressable, Platform } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';
import { useRouter } from 'expo-router';
import { useSettings } from "@/contexts/SettingsContext";
import { ClockDisplay } from '../ClockDisplay';

type HeaderProps = {
  currentReference: string;
  isConnected: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function Header({
  currentReference, 
  isConnected, 
  isRefreshing, 
  onRefresh,
}: HeaderProps) {
  const router = useRouter();
  const { normalVerseBackgroundColor } = useSettings();

  return (
    <View style={[
      styles.header, 
      { 
        backgroundColor: normalVerseBackgroundColor,
        paddingTop: Platform.OS === 'web' ? 0 : 20
      }
    ]}>
      <View style={styles.leftSection}>
        <ClockDisplay />
      </View>
      <View style={styles.rightSection}>
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
        <Pressable 
          onPress={onRefresh}
          style={[styles.iconButton, isRefreshing && styles.rotating]}
        >
          <IconSymbol 
            name="arrow.clockwise" 
            size={24} 
            color={normalVerseBackgroundColor === '#000000' ? '#fff' : '#000'}
          />
        </Pressable>
        <Pressable 
          onPress={() => router.push('/settings')}
          style={styles.iconButton}
        >
          <IconSymbol 
            name="gear" 
            size={24} 
            color={normalVerseBackgroundColor === '#000000' ? '#fff' : '#000'} 
          />
        </Pressable>
      </View>
    </View>
  );
}
