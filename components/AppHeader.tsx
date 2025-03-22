import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useSettings } from "@/contexts/SettingsContext";
import { ClockDisplay } from './ClockDisplay';

type AppHeaderProps = {
  isConnected: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  currentReference?: string;
};

export function AppHeader({
  isConnected,
  isRefreshing = false,
  onRefresh,
  currentReference,
}: AppHeaderProps) {
  const router = useRouter();
  const { normalVerseBackgroundColor, usageMode } = useSettings();

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
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4AFF50' : '#FF3A3A' }]} />
        {usageMode === 'bible' && onRefresh && (
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
        )}
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    zIndex: 10,
  },
  leftSection: {
    flex: 1,
    paddingLeft: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconButton: {
    padding: 8,
  },
  rotating: {
    // Animation would be added here
  },
});
