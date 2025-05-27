import React, { useState, useEffect } from 'react';
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
import { AppUser, updateDoctor } from '../../lib/firebase-service';
import { DoctorSpecialization } from '../../types/User';

interface EditDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser: AppUser | null;
}

const specializations: DoctorSpecialization[] = ['specialist', 'primar', 'rezident'];

export const EditDoctorModal: React.FC<EditDoctorModalProps> = ({
  visible,
  onClose,
  onSuccess,
  selectedUser,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // State-uri pentru câmpuri
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cuim, setCUIM] = useState('');
  const [specializationType, setSpecializationType] = useState<DoctorSpecialization>('rezident');
  const [studies, setStudies] = useState('');
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [institutionInput, setInstitutionInput] = useState('');
  const [biography, setBiography] = useState('');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hasCAS, setHasCAS] = useState(false);

  // Prepopulează datele la deschiderea modalului
 // Prepopulează datele la deschiderea modalului
useEffect(() => {
  if (selectedUser) {
    setFirstName(selectedUser.firstName || selectedUser.name || '');
    setLastName(selectedUser.lastName || '');
    setCUIM(selectedUser.cuim || '');
    setSpecializationType(selectedUser.specializationType || 'rezident');
    setStudies(selectedUser.studies || '');
    setInstitutions(selectedUser.institutions || []);
    setBiography(selectedUser.biography || '');
    setCity(selectedUser.city || '');
    setExperienceYears(
      selectedUser.experienceYears !== undefined
        ? String(selectedUser.experienceYears)
        : ''
    );
    setHasCAS(!!selectedUser.hasCAS);
  }
}, [selectedUser, visible]);

  // Resetare la închidere
  useEffect(() => {
    if (!visible) {
      setFirstName('');
      setLastName('');
      setCUIM('');
      setSpecializationType('rezident');
      setStudies('');
      setInstitutions([]);
      setInstitutionInput('');
      setBiography('');
      setCity('');
      setExperienceYears('');
      setHasCAS(false);
    }
  }, [visible]);

  const handleAddInstitution = () => {
    if (institutionInput.trim() && !institutions.includes(institutionInput.trim())) {
      setInstitutions([...institutions, institutionInput.trim()]);
      setInstitutionInput('');
    }
  };

  const handleRemoveInstitution = (idx: number) => {
    setInstitutions(institutions.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
  if (!selectedUser) return;
  if (!firstName || !lastName || !cuim || !specializationType || institutions.length === 0) {
    Alert.alert('Eroare', 'Vă rugăm să completați toate câmpurile obligatorii.');
    return;
  }
  try {
    const doctorPayload: any = {
      firstName,
      lastName,
      username: selectedUser.username,
      email: selectedUser.email,
      cuim,
      specializationType,
      reviews: selectedUser.reviews || [],
      approved: true,
      studies,
      institutions,
      biography,
      city,
    };
    if (experienceYears) {
      doctorPayload.experienceYears = Number(experienceYears);
    }
    await updateDoctor(selectedUser.id, doctorPayload);
    Alert.alert('Succes', 'Datele doctorului au fost actualizate!');
    onSuccess();
    onClose();
  } catch (err) {
    Alert.alert('Eroare', 'Nu am putut salva modificările.');
  }
};

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Editează Doctor</Text>
          <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <TextInput
              placeholder="Prenume *"
              placeholderTextColor={theme.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <TextInput
              placeholder="Nume *"
              placeholderTextColor={theme.textSecondary}
              value={lastName}
              onChangeText={setLastName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <TextInput
              placeholder="Număr CUIM *"
              placeholderTextColor={theme.textSecondary}
              value={cuim}
              onChangeText={setCUIM}
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <View style={{ marginBottom: 15 }}>
              <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
                Specializare *
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {specializations.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[
                      styles.specializationButton,
                      {
                        backgroundColor: specializationType === spec ? theme.primary : theme.textInputBackground,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setSpecializationType(spec)}
                  >
                    <Text style={{
                      color: specializationType === spec ? 'white' : theme.textPrimary,
                      fontWeight: 'bold',
                    }}>
                      {spec.charAt(0).toUpperCase() + spec.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              placeholder="Facultate și an finalizare (opțional)"
              placeholderTextColor={theme.textSecondary}
              value={studies}
              onChangeText={setStudies}
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            {/* Instituții */}
            <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
              Clinici/Instituții (cel puțin una) *
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                placeholder="Adaugă clinică/instituție"
                placeholderTextColor={theme.textSecondary}
                value={institutionInput}
                onChangeText={setInstitutionInput}
                style={[
                  styles.input,
                  { flex: 1, marginBottom: 0, marginRight: 8, backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }
                ]}
              />
              <TouchableOpacity
                onPress={handleAddInstitution}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Adaugă</Text>
              </TouchableOpacity>
            </View>
            {institutions.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                {institutions.map((inst, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: theme.textPrimary, flex: 1 }}>{inst}</Text>
                    <TouchableOpacity onPress={() => handleRemoveInstitution(idx)}>
                      <Text style={{ color: 'red', marginLeft: 8 }}>Șterge</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TextInput
              placeholder="Biografie (opțional)"
              placeholderTextColor={theme.textSecondary}
              value={biography}
              onChangeText={setBiography}
              multiline
              maxLength={500}
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  height: 80,
                },
              ]}
            />
            <TextInput
              placeholder="Oraș (opțional)"
              placeholderTextColor={theme.textSecondary}
              value={city}
              onChangeText={setCity}
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <TextInput
              placeholder="Ani de experiență (opțional)"
              placeholderTextColor={theme.textSecondary}
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.casButton,
                {
                  backgroundColor: hasCAS ? theme.primary : theme.textInputBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setHasCAS(!hasCAS)}
            >
              <Text style={{
                color: hasCAS ? 'white' : theme.textPrimary,
                fontWeight: 'bold',
              }}>
                Are contract cu CAS
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Salvează</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.border, marginLeft: 10 }]}
              onPress={onClose}
            >
              <Text style={{ color: theme.textPrimary }}>Anulează</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '92%',
    borderRadius: 16,
    padding: 18,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 40,
  },
  specializationButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  casButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
});