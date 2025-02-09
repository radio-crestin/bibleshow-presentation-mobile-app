import { StyleSheet, View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

type PowerSaveOverlayProps = {
  active: boolean;
};

export function PowerSaveOverlay({ active }: PowerSaveOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: active ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [active]);

  return (
    <Animated.View 
      style={[
        styles.overlay,
        { opacity },
        active && styles.active
      ]} 
      pointerEvents={active ? 'auto' : 'none'}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  active: {
    elevation: 1000,
  },
});
