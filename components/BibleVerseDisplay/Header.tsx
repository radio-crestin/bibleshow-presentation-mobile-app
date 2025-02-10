import { View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';
import { useRouter } from 'expo-router';
import {useSettings} from "@/contexts/SettingsContext";

type HeaderProps = {
  currentReference: string;
  isConnected: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  paddingTop: number;
};

export function Header({
  currentReference, 
  isConnected, 
  isRefreshing, 
  onRefresh,
  paddingTop 
}: HeaderProps) {
  const router = useRouter();
  const { showSeconds, clockSize } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={{ position: 'absolute', left: 16, top: paddingTop + 16 }}>
        <ThemedText style={[styles.currentReference, { fontSize: clockSize, textAlign: 'left' }]}>
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined,
            hour12: false 
          })}
        </ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, position: 'absolute', right: 16, top: paddingTop + 16 }}>
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
        <Pressable 
          onPress={onRefresh}
          style={[styles.iconButton, isRefreshing && styles.rotating]}
        >
          <IconSymbol name="arrow.clockwise" size={24} color={""}/>
        </Pressable>
        <Pressable 
          onPress={() => router.push('/settings')}
          style={styles.iconButton}
        >
          <IconSymbol name="gear" size={24} color={""} />
        </Pressable>
      </View>
    </View>
  );
}
