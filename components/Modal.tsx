import { Modal as RNModal, View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ visible, onClose, title, children }) => {
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setRenderKey(prev => prev + 1);
    }
  }, [visible]);

  return (
    <RNModal
     key={renderKey}
      visible={visible}
      animationType="slide"
      transparent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: width * 0.9,
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    marginHorizontal: 'auto',
    ...Platform.select({
      android: { 
        elevation: 5,
        width: '90%',
      },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%'
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1
  },
  content: {
    flexGrow: 1,
    width: '100%'
  }
});

export default Modal;