import { Text, type TextProps, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const fontSize = StyleSheet.flatten(style || {})?.fontSize || getDefaultFontSize(type);
  const lineHeight = Math.round(fontSize * 1.3); // 1.3x line height ratio

  // For web platform, we need to be extra careful with styles
  if (Platform.OS === 'web') {
    // Create a base style object with all the type-specific styles
    // Explicitly set properties to avoid array or object values
    const baseStyle = {
      color: color,
      lineHeight: lineHeight,
      fontSize: getDefaultFontSize(type),
      fontWeight: type === 'default' ? 'normal' : 
                 type === 'title' ? 'bold' : 
                 type === 'defaultSemiBold' ? '600' : 
                 type === 'subtitle' ? 'bold' : 
                 type === 'link' ? 'normal' : 'normal'
    };
    
    // Use try/catch to handle any potential errors with StyleSheet.flatten
    try {
      // Only flatten if style is provided
      const flattenedStyle = style ? StyleSheet.flatten([baseStyle, style]) : baseStyle;
      return <Text style={flattenedStyle} {...rest} />;
    } catch (error) {
      console.warn('Style flattening error:', error);
      // Fallback to just using the base style if there's an error
      return <Text style={baseStyle} {...rest} />;
    }
  }
  
  // For native platforms, array styles work fine
  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        { lineHeight },
        style,
      ]}
      {...rest}
    />
  );
}

function getDefaultFontSize(type: ThemedTextProps['type']) {
  switch (type) {
    case 'title':
      return 32;
    case 'subtitle':
      return 20;
    case 'default':
    case 'defaultSemiBold':
    case 'link':
    default:
      return 16;
  }
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 16,
    color: '#0a7ea4',
  },
});
