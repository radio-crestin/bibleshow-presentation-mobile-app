import { View, Pressable, Platform, ActivityIndicator } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';
import { useRouter } from 'expo-router';
import { useSettings } from "@/contexts/SettingsContext";
import { ClockDisplay } from '../ClockDisplay';
import { useMicrophoneContext } from '../MicrophoneContext';

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
  const { isUpdating } = useMicrophoneContext();

  const textColor = normalVerseBackgroundColor === '#000000' ? '#fff' : '#000';

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
      
      {isUpdating && (
        <View style={styles.centerSection}>
          <ActivityIndicator size="small" color={textColor} />
        </View>
      )}
      
      <View style={styles.rightSection}>
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
        <Pressable 
          onPress={onRefresh}
          style={[styles.iconButton, isRefreshing && styles.rotating]}
        >
          <IconSymbol 
            name="arrow.clockwise" 
            size={24} 
            color={textColor}
          />
        </Pressable>
        <Pressable 
          onPress={() => router.push('/settings')}
          style={styles.iconButton}
        >
          <IconSymbol 
            name="gear" 
            size={24} 
            color={textColor} 
          />
        </Pressable>
      </View>
    </View>
  );
}
