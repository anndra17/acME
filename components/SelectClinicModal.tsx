import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import ClinicMapScreen, { Clinic } from './ClinicMapScreen';

interface Theme {
  background: string;
  primary: string;
  border: string;
  textSecondary: string;
}

interface SelectClinicModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectClinic: (clinic: Clinic) => void;
  clinics: Clinic[];
  theme: Theme;
}

export default function SelectClinicModal({
  visible,
  onClose,
  onSelectClinic,
  clinics,
  theme,
}: SelectClinicModalProps) {
  const [showMap, setShowMap] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Alege o clinică</Text>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
          }}
          onPress={() => setShowMap(true)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Alege de pe hartă</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 12,
          }}
          onPress={onClose}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Închide</Text>
        </TouchableOpacity>
      </View>
      {showMap && (
        <ClinicMapScreen
          clinics={clinics}
          initialRegion={{
            latitude: clinics[0]?.latitude || 45.65,
            longitude: clinics[0]?.longitude || 25.6,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onClose={() => setShowMap(false)}
          onSelectClinic={(clinic) => {
            onSelectClinic(clinic);
            setShowMap(false);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}