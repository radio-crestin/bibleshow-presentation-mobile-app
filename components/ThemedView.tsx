import { View, type ViewProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  // Create a StyleSheet style to avoid array style issues on web
  const baseStyle = { backgroundColor };
  
  // Handle different style types safely
  const combinedStyle = StyleSheet.flatten([baseStyle, style]);
  
  return <View style={combinedStyle} {...otherProps} />;
}
