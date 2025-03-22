/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  // Ensure we always return a valid color string
  if (colorFromProps && typeof colorFromProps === 'string') {
    return colorFromProps;
  } else {
    // Provide a fallback in case Colors[theme][colorName] is undefined
    return Colors[theme][colorName] || (theme === 'dark' ? '#000' : '#fff');
  }
}
