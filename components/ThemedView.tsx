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
    // Make sure we're explicitly setting backgroundColor as a property
    const baseStyle = { backgroundColor: backgroundColor };
    
    // Use try/catch to handle any potential errors with StyleSheet.flatten
    try {
      const flattenedStyle = style ? StyleSheet.flatten([baseStyle, style]) : baseStyle;
      return <View style={flattenedStyle} {...otherProps} />;
    } catch (error) {
      console.warn('Style flattening error:', error);
      // Fallback to just using the base style if there's an error
      return <View style={baseStyle} {...otherProps} />;
    }
  }
  
  // For native platforms, array styles work fine
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
