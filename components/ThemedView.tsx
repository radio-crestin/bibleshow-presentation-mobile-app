import { View, type ViewProps, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  // For web platform, we need to be extra careful with styles
  if (Platform.OS === 'web') {
    // Create a single style object with all properties
    const flattenedStyle = StyleSheet.flatten([{ backgroundColor }, style || {}]);
    
    return <View style={flattenedStyle} {...otherProps} />;
  }
  
  // For native platforms, array styles work fine
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
