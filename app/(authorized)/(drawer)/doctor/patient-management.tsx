import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';

// Mock data for patients
const mockPatients = [
  {
    id: '1',
    name: 'Maria Popescu',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    pendingPosts: 3,
    treatment: 'Acne Treatment',
    lastVisit: '2024-03-15'
  },
  {
    id: '2',
    name: 'Ion Ionescu',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    pendingPosts: 1,
    treatment: 'Skin Care Routine',
    lastVisit: '2024-03-10'
  },
  {
    id: '3',
    name: 'Ana Dumitrescu',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    pendingPosts: 2,
    treatment: 'Anti-aging Treatment',
    lastVisit: '2024-03-12'
  },
];

const PatientManagement = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];
  const [patients] = useState(mockPatients);

  const handleAddPatient = () => {
    // TODO: Implement add patient functionality
    console.log('Add patient pressed');
  };

  const handlePatientPress = (patientId: string) => {
    router.push(`/user/${patientId}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Stats and Add Button Row */}
      <View style={styles.topRow}>
        {/* Stats Card */}
        <View style={[styles.statsCard, { 
          backgroundColor: theme.textInputBackground,
          borderColor: theme.border,
          borderWidth: 1
        }]}>
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>{patients.length}</Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Total Patients</Text>
        </View>

        {/* Add Patient Button */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddPatient}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Patient</Text>
        </TouchableOpacity>
      </View>

      {/* Patients Grid */}
      <View style={styles.patientsGrid}>
        {patients.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={[styles.patientCard, { 
              backgroundColor: theme.textInputBackground,
              borderColor: theme.border,
              borderWidth: 1
            }]}
            onPress={() => handlePatientPress(patient.id)}
          >
            <Image source={{ uri: patient.image }} style={styles.patientImage} />
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { color: theme.textPrimary }]}>{patient.name}</Text>
              <View style={styles.patientDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="document-text-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {patient.pendingPosts} posts to review
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="medical-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {patient.treatment}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    Last visit: {patient.lastVisit}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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