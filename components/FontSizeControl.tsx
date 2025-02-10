import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

type FontSizeControlProps = {
  label: string;
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function FontSizeControl({ label, value, onIncrease, onDecrease }: FontSizeControlProps) {
  return (
    <View style={styles.fontSizeSection}>
      <ThemedText style={styles.fontSizeLabel}>{label}</ThemedText>
      <View style={styles.fontSizeControl}>
        <Pressable 
          onPress={onDecrease}
          style={styles.button}
        >
          <IconSymbol name="minus.circle.fill" size={32} color={''} />
        </Pressable>
        <ThemedText style={styles.fontSize}>{value}</ThemedText>
        <Pressable 
          onPress={onIncrease}
          style={styles.button}
        >
          <IconSymbol name="plus.circle.fill" size={32} color={''} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fontSizeSection: {
    marginBottom: 16,
  },
  fontSizeLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  fontSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 8,
    borderRadius: 12,
  },
  fontSize: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  button: {
    padding: 8,
  },
});
