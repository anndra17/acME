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

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 coloane cu padding
const CONTAINER_PADDING = 15; // Reducem padding-ul containerului

const AdminManageDoctors = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(true);

  // Hardcoded statistics for now
  const stats = {
    totalDoctors: 12,
    totalClinics: 5,
  };

  // Hardcoded doctors list for now
  const doctors = [
    {
      id: '1',
      name: 'Dr. Popescu',
      specialty: 'Dermatologie',
      clinic: 'MedLife',
      experience: '10 ani',
    },
    {
      id: '2',
      name: 'Dr. Ionescu',
      specialty: 'Dermatologie',
      clinic: 'Sanador',
      experience: '5 ani',
    },
    // Add more sample doctors as needed
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
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
          >
            <View style={styles.doctorImagePlaceholder}>
              <Ionicons name="person" size={40} color={theme.textSecondary} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={[styles.doctorName, { color: theme.textPrimary }]}>
                {doctor.name}
              </Text>
              <Text style={[styles.doctorSpecialty, { color: theme.textSecondary }]}>
                {doctor.specialty}
              </Text>
              <Text style={[styles.doctorClinic, { color: theme.textSecondary }]}>
                {doctor.clinic}
              </Text>
              <Text style={[styles.doctorExperience, { color: theme.textSecondary }]}>
                Experiență: {doctor.experience}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
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

export default AdminManageDoctors;
