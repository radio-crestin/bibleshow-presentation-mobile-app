import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

type ColorPreviewProps = {
  color: string;
  label: string;
  onPress: () => void;
};

export function ColorPreview({ color, label, onPress }: ColorPreviewProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Pressable 
        onPress={onPress} 
        style={[
          styles.previewContainer,
          { backgroundColor: useColorScheme() === 'dark' ? '#2c2c2e' : '#f5f5f5' }
        ]}
      >
        <View style={[styles.colorPreview, { backgroundColor: color }]} />
        <ThemedText style={styles.colorText}>{color}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorText: {
    fontSize: 16,
    textTransform: 'uppercase',
  },
});
