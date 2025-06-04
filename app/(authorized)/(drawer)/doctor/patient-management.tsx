import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { getDoc, doc, getDocs, collection, where, query } from 'firebase/firestore';
import { firestore } from '../../../../lib/firebase-config';
import { useSession } from '../../../../context'; // sau de unde iei userul logat
import { AddPatientModal } from '../../../../components/doctor/AddPatientModal';

const PatientManagement = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];
  const { user } = useSession();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchPatients = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const doctorRef = doc(firestore, 'users', user.uid);
    const doctorSnap = await getDoc(doctorRef);
    if (!doctorSnap.exists()) {
      setPatients([]);
      setLoading(false);
      return;
    }
    const doctorData = doctorSnap.data();
    const patientIds: string[] = doctorData.patients || [];
    if (patientIds.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(firestore, 'users'),
      where('__name__', 'in', patientIds.slice(0, 10))
    );
    const snapshot = await getDocs(q);
    const fetchedPatients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPatients(fetchedPatients);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, [user?.uid]);

  const handleAddPatient = () => {
    setAddModalVisible(true);
  };

  const handlePatientPress = (patientId: string) => {
    // DE IMPLEMENTAT ECRAN DE DETALII PACIENT
    router.push(`./user/${patientId}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topRow}>
        <View style={[styles.statsCard, { 
          backgroundColor: theme.textInputBackground,
          borderColor: theme.border,
          borderWidth: 1
        }]}>
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>{patients.length}</Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Total Patients</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddPatient}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Patient</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.patientsGrid}>
        {loading ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 24 }}>Se încarcă...</Text>
        ) : patients.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 24 }}>Nu ai pacienți conectați.</Text>
        ) : (
          patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={[styles.patientCard, { 
                backgroundColor: theme.textInputBackground,
                borderColor: theme.border,
                borderWidth: 1
              }]}
              onPress={() => handlePatientPress(patient.id)}
            >
              <Image source={{ uri: patient.profileImage || 'https://placehold.co/200x200?text=No+Image' }} style={styles.patientImage} />
              <View style={styles.patientInfo}>
                <Text style={[styles.patientName, { color: theme.textPrimary }]}>{patient.name || patient.username || patient.email}</Text>
                <View style={styles.patientDetails}>
                  {/* Poți adăuga aici detalii reale dacă le ai în user */}
                  <View style={styles.detailItem}>
                    <Ionicons name="medical-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {patient.treatment || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      Last visit: {patient.lastVisit || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      <AddPatientModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        doctorId={user?.uid || ""}
        onSuccess={fetchPatients}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    width: '45%',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  patientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  patientCard: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  patientImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  patientInfo: {
    padding: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patientDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
});

export default PatientManagement;