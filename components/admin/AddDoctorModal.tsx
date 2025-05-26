import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Doctor, DoctorSpecialization } from '../../types/User';
import { AppUser } from '../../lib/firebase-service';

interface AddDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser: AppUser | null;
}

const specializations: DoctorSpecialization[] = ['specialist', 'primar', 'rezident'];

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  visible,
  onClose,
  onSuccess,
  selectedUser,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [medicalSchool, setMedicalSchool] = useState('');
  const [specialization, setSpecialization] = useState<DoctorSpecialization>('specialist');
  const [clinics, setClinics] = useState<string[]>([]);
  const [newClinic, setNewClinic] = useState('');
  const [hasCAS, setHasCAS] = useState(false);

  const handleAddClinic = () => {
    if (newClinic.trim()) {
      setClinics([...clinics, newClinic.trim()]);
      setNewClinic('');
    }
  };

  const handleRemoveClinic = (index: number) => {
    setClinics(clinics.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    if (!licenseNumber || !experience || !medicalSchool || clinics.length === 0) {
      Alert.alert('Eroare', 'Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }

    try {
      // TODO: Implement the addDoctor function in firebase-service
      // await addDoctor({
      //   ...selectedUser,
      //   licenseNumber,
      //   experience: parseInt(experience),
      //   medicalSchool,
      //   specialization,
      //   clinics,
      //   hasCAS,
      // });

      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut adăuga doctorul.');
      console.error('Error adding doctor:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Adaugă Doctor Nou
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedUser && (
              <View style={styles.selectedUser}>
                <Text style={[styles.selectedUserText, { color: theme.textPrimary }]}>
                  Utilizator selectat: {selectedUser.username}
                </Text>
              </View>
            )}

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.textInputBackground,
                color: theme.textPrimary,
                borderColor: theme.border
              }]}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="Număr CUIM"
              placeholderTextColor={theme.textSecondary}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.textInputBackground,
                color: theme.textPrimary,
                borderColor: theme.border
              }]}
              value={experience}
              onChangeText={setExperience}
              placeholder="Ani de experiență"
              keyboardType="numeric"
              placeholderTextColor={theme.textSecondary}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.textInputBackground,
                color: theme.textPrimary,
                borderColor: theme.border
              }]}
              value={medicalSchool}
              onChangeText={setMedicalSchool}
              placeholder="Facultatea de medicină absolvită"
              placeholderTextColor={theme.textSecondary}
            />

            <View style={styles.specializationContainer}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Specializare:</Text>
              <View style={styles.specializationButtons}>
                {specializations.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[
                      styles.specializationButton,
                      { 
                        backgroundColor: specialization === spec ? theme.primary : theme.textInputBackground,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setSpecialization(spec)}
                  >
                    <Text style={[
                      styles.specializationButtonText,
                      { color: specialization === spec ? 'white' : theme.textPrimary }
                    ]}>
                      {spec.charAt(0).toUpperCase() + spec.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.clinicsContainer}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Clinicile:</Text>
              <View style={styles.clinicInputContainer}>
                <TextInput
                  style={[styles.clinicInput, { 
                    backgroundColor: theme.textInputBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }]}
                  value={newClinic}
                  onChangeText={setNewClinic}
                  placeholder="Adaugă clinică"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity
                  style={[styles.addClinicButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddClinic}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
              {clinics.map((clinic, index) => (
                <View key={index} style={styles.clinicItem}>
                  <Text style={[styles.clinicText, { color: theme.textPrimary }]}>{clinic}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveClinic(index)}
                    style={styles.removeClinicButton}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.casButton, { 
                backgroundColor: hasCAS ? theme.primary : theme.textInputBackground,
                borderColor: theme.border
              }]}
              onPress={() => setHasCAS(!hasCAS)}
            >
              <Text style={[
                styles.casButtonText,
                { color: hasCAS ? 'white' : theme.textPrimary }
              ]}>
                Are contract cu CAS
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Adaugă Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    marginBottom: 20,
  },
  selectedUser: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedUserText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  specializationContainer: {
    marginBottom: 20,
  },
  specializationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specializationButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  specializationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clinicsContainer: {
    marginBottom: 20,
  },
  clinicInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  clinicInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addClinicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 8,
  },
  clinicText: {
    fontSize: 14,
  },
  removeClinicButton: {
    padding: 4,
  },
  casButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  casButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    marginTop: 10,
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 