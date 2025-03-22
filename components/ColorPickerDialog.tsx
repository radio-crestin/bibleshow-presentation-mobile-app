import React, { useState } from 'react';
import {Modal, StyleSheet, Pressable, View} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import ColorPicker from 'react-native-wheel-color-picker';

type ColorPickerDialogProps = {
  visible: boolean;
  onClose: () => void;
  onColorSelected: (color: string) => void;
  initialColor: string;
  title: string;
};

export function ColorPickerDialog({ 
  visible, 
  onClose, 
  onColorSelected, 
  initialColor = '#ffffff',
  title = 'Select Color'
}: ColorPickerDialogProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor || '#ffffff');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalOverlay}>
        <ThemedView 
          style={styles.modalContent}
          lightColor="#ffffff"
          darkColor="#1c1c1e"
        >
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.colorPickerContainer}>
            <ColorPicker
              color={selectedColor}
              onColorChange={setSelectedColor}
              thumbSize={30}
              sliderSize={30}
              noSnap={true}
              row={false}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <ThemedText style={[styles.buttonText, styles.cancelButtonText]}>Anulează</ThemedText>
            </Pressable>
            <Pressable 
              style={[styles.button, styles.selectButton]}
              onPress={() => {
                onColorSelected(selectedColor);
                onClose();
              }}
            >
              <ThemedText style={styles.buttonText}>Selectează</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorPickerContainer: {
    height: 280,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  selectButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#000',
    opacity: 0.8,
  },
});
