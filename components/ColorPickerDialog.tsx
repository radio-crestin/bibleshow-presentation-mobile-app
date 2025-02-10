import React, { useState } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
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
  initialColor,
  title 
}: ColorPickerDialogProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
        </View>
      </View>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
  },
});
