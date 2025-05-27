import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors } from '../../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppUser, getAllDoctors, getDoctorsCount, removeDoctorRole } from '../../../../../lib/firebase-service';
import { AddDoctorModal } from '../../../../../components/admin/AddDoctorModal';
import { SelectUserModal } from '../../../../../components/admin/SelectUserModal';
import { PromoteUserModal } from '../../../../../components/admin/PromoteUserModal';
import { EditDoctorModal } from '../../../../../components/admin/EditDoctorModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 coloane cu padding
const CONTAINER_PADDING = 15; // Reducem padding-ul containerului

export default function AdminManageDoctors() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSelectUserModalVisible, setIsSelectUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [doctors, setDoctors] = useState<AppUser[]>([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [editDoctor, setEditDoctor] = useState<AppUser | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Hardcoded statistics for now
  const stats = {
    totalDoctors,
    totalClinics: 5,
  };

  useEffect(() => {
    const fetchDoctorsCount = async () => {
      try {
        const count = await getDoctorsCount();
        setTotalDoctors(count);
      } catch (err) {
        setTotalDoctors(0);
      }
    };
    fetchDoctorsCount();
  }, []);

  // În AdminManageDoctors (doctors.tsx)
const fetchDoctors = async () => {
  setLoading(true);
  try {
    const doctorsFromDb = await getAllDoctors();
    setDoctors(doctorsFromDb);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchDoctors();
}, []);
 
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddDoctor = () => {
    setIsAddModalVisible(true);
  };

  const handleUserSelect = (user: AppUser) => {
    setSelectedUser(user);
    setIsSelectUserModalVisible(false);
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    // TODO: Refresh doctors list after adding a new one
  };

  const handleRemoveDoctor = async (userId: string) => {
  try {
    await removeDoctorRole(userId);
    fetchDoctors(); // reîncarcă lista după eliminare
    Alert.alert('Succes', 'Doctorul a fost eliminat.');
  } catch (err) {
    Alert.alert('Eroare', 'Nu am putut elimina statusul de doctor.');
  }
};

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Gestionare Doctori
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddDoctor}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="people" size={24} color={theme.primary} />
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
            {stats.totalDoctors}
          </Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Doctori
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="business" size={24} color={theme.primary} />
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
            {stats.totalClinics}
          </Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Clinici
          </Text>
        </View>
      </View>

      {/* Doctors List */}
      <ScrollView style={styles.doctorsList}>
  {doctors.map((doctor) => (
    <TouchableOpacity
      key={doctor.id}
      style={[styles.doctorCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => {
        setEditDoctor(doctor);
        setIsEditModalVisible(true);
      }}
    >

    <TouchableOpacity
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: 16,
          padding: 2,
        }}
        onPress={() => {
          Alert.alert(
            'Confirmare',
            'Ești sigur că vrei să elimini statusul de doctor?',
            [
              { text: 'Anulează', style: 'cancel' },
              {
                text: 'Elimină',
                style: 'destructive',
                onPress: () => handleRemoveDoctor(doctor.id),
              },
            ]
          );
        }}
      >
        <Ionicons name="close-circle" size={24} color={theme.primary} />
      </TouchableOpacity>

      <View style={styles.doctorImagePlaceholder}>
        <Ionicons name="person" size={40} color={theme.textSecondary} />
      </View>
      <View style={styles.doctorInfo}>
        <Text style={[styles.doctorName, { color: theme.textPrimary }]}>
          {doctor.name || doctor.username}
        </Text>
        <Text style={[styles.doctorSpecialty, { color: theme.textSecondary }]}>
          {doctor.specializationType || 'Specializare necunoscută'}
        </Text>
        <Text style={[styles.doctorClinic, { color: theme.textSecondary }]}>
          {(doctor.institutions && doctor.institutions.length > 0)
            ? doctor.institutions.join(', ')
            : 'Fără clinică'}
        </Text>
        <Text style={[styles.doctorExperience, { color: theme.textSecondary }]}>
          Experiență: {doctor.experienceYears ? `${doctor.experienceYears} ani` : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  ))}
</ScrollView>

<EditDoctorModal
  visible={isEditModalVisible}
  onClose={() => {
    setIsEditModalVisible(false);
    setEditDoctor(null);
  }}
  onSuccess={() => {
    setIsEditModalVisible(false);
    setEditDoctor(null);
    fetchDoctors();
  }}
  selectedUser={editDoctor} // asigură-te că prop-ul se numește selectedUser!
/>

  <PromoteUserModal
      visible={isAddModalVisible}
      onClose={handleCloseModal}
      onSuccess={() => {
        handleCloseModal();
        fetchDoctors(); 
      }}
      roleType="doctor"
      />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  statsCard: {
    width: CARD_WIDTH,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 14,
  },
  doctorsList: {
    flex: 1,
    paddingHorizontal: 5,
  },
  doctorCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  doctorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    marginBottom: 2,
  },
  doctorClinic: {
    fontSize: 14,
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 14,
  },
});
