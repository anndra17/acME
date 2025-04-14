import React from 'react';
import { Modal as RNModal, View, StyleSheet, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Asigură-te că ai instalat @expo/vector-icons
import { Colors } from '../constants/Colors';


interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];
  
  return (
    <RNModal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, {backgroundColor: theme.background}]}>
          <View style={styles.closeIconContainer}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 12,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  }
});

export default Modal;
