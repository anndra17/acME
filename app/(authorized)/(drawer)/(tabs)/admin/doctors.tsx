import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Colors } from '../../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppUser,
  getAllDoctors,
  getDoctorsCount,
  removeDoctorRole,
  getAllConnectionRequests,
  getUserProfile,
  extractDoctorRequestFormData,
  acceptDoctorRequest,
  rejectDoctorRequest,
} from '../../../../../lib/firebase-service';
import { PromoteUserModal } from '../../../../../components/admin/PromoteUserModal';
import { EditDoctorModal } from '../../../../../components/admin/EditDoctorModal';
import { ActivityIndicator } from 'react-native-paper';

const { width } = Dimensions.get('window');
const CONTAINER_PADDING = 15;
const CARD_SIZE = (width - CONTAINER_PADDING * 2 - 24) / 3;

export default function AdminManageDoctors() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSelectUserModalVisible, setIsSelectUserModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [adminRequestsModalVisible, setAdminRequestsModalVisible] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

  // Selected user/doctor/request for modals
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editDoctor, setEditDoctor] = useState<AppUser | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Doctors and statistics
  const [doctors, setDoctors] = useState<AppUser[]>([]);
  const [totalDoctors, setTotalDoctors] = useState(0);

  // Admin requests and related users
  const [adminRequestsCount, setAdminRequestsCount] = useState(0);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminRequestsUsers, setAdminRequestsUsers] = useState<{ [key: string]: any }>({});

  // Hardcoded statistics for demonstration
  const stats = {
    totalDoctors,
    totalClinics: 5,
  };

  // Fetch total number of doctors
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

  // Fetch all doctors from Firestore
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

  // Simulate loading for UI polish
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Open add doctor modal
  const handleAddDoctor = () => {
    setIsAddModalVisible(true);
  };

  // Close add doctor modal
  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setSelectedUser(null);
  };

  // Remove doctor role from a user
  const handleRemoveDoctor = async (userId: string) => {
    try {
      await removeDoctorRole(userId);
      fetchDoctors(); // Refresh list after removal
      Alert.alert('Succes', 'Doctorul a fost eliminat.');
    } catch (err) {
      Alert.alert('Eroare', 'Nu am putut elimina statusul de doctor.');
    }
  };

  // Fetch all pending doctor requests to admin
  useEffect(() => {
    const fetchAdminRequests = async () => {
      try {
        const allRequests = await getAllConnectionRequests();
        // Only pending doctor requests to admin
        const requestsToAdmin = allRequests.filter(
          (req: any) =>
            !!req.toAdminId &&
            req.type === 'doctor-request' &&
            req.status === 'pending'
        );
        setAdminRequests(requestsToAdmin);
        setAdminRequestsCount(requestsToAdmin.length);
      } catch (err) {
        setAdminRequests([]);
        setAdminRequestsCount(0);
      }
    };
    fetchAdminRequests();
  }, []);

  // Fetch user profile for each request
  useEffect(() => {
    const fetchUsers = async () => {
      const usersObj: { [key: string]: any } = {};
      for (const req of adminRequests) {
        if (req.fromUserId && !usersObj[req.fromUserId]) {
          try {
            const userData = await getUserProfile(req.fromUserId);
            usersObj[req.fromUserId] = userData;
          } catch (e) {
            usersObj[req.fromUserId] = null;
          }
        }
      }
      setAdminRequestsUsers(usersObj);
    };
    if (adminRequests.length > 0) {
      fetchUsers();
    }
  }, [adminRequests]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Accept a doctor request
  const handleAcceptRequest = async (request: any) => {
    try {
      await acceptDoctorRequest(request);
      Alert.alert('Cerere acceptată', 'Utilizatorul a fost promovat la doctor.');
      setShowRequestDetails(false);
      setSelectedRequest(null);
      // Refresh doctors and requests
      fetchDoctors();
      const allRequests = await getAllConnectionRequests();
      const requestsToAdmin = allRequests.filter(
        (req: any) =>
          !!req.toAdminId &&
          req.type === 'doctor-request' &&
          req.status === 'pending'
      );
      setAdminRequests(requestsToAdmin);
      setAdminRequestsCount(requestsToAdmin.length);
    } catch (err) {
      Alert.alert('Eroare', 'Nu am putut accepta cererea.');
    }
  };

  // Reject a doctor request
  const handleRejectRequest = async (request: any) => {
    try {
      await rejectDoctorRequest(request.id);
      Alert.alert('Cerere respinsă', 'Cererea a fost respinsă.');
      setShowRequestDetails(false);
      setSelectedRequest(null);
      // Refresh requests
      const allRequests = await getAllConnectionRequests();
      const requestsToAdmin = allRequests.filter(
        (req: any) =>
          !!req.toAdminId &&
          req.type === 'doctor-request' &&
          req.status === 'pending'
      );
      setAdminRequests(requestsToAdmin);
      setAdminRequestsCount(requestsToAdmin.length);
    } catch (err) {
      Alert.alert('Eroare', 'Nu am putut respinge cererea.');
    }
  };

  // Extract form data from selected request for details modal
  let formData = undefined;
  if (selectedRequest) {
    formData = extractDoctorRequestFormData(selectedRequest);
    // DEBUG: see request structure and extracted data
    // console.log('selectedRequest:', selectedRequest);
    // console.log('formData:', formData);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with title and add doctor button */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Manage Doctors
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddDoctor}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Statistics cards */}
      <View style={[styles.statsRow]}>
        <View style={[styles.statsCircle, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="people" size={28} color={theme.primary} />
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
            {stats.totalDoctors}
          </Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Doctors
          </Text>
        </View>
        <View style={[styles.statsCircle, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="business" size={28} color={theme.primary} />
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
            {stats.totalClinics}
          </Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Clinics
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.statsCircle, { backgroundColor: theme.cardBackground }]}
          onPress={() => setAdminRequestsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="mail" size={28} color={theme.primary} />
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
            {adminRequestsCount}
          </Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Pending Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal for admin requests */}
      <Modal
        visible={adminRequestsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAdminRequestsModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 20,
            width: '90%',
            maxHeight: '80%',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: theme.textPrimary }}>
              Requests to admin
            </Text>
            {/* List of pending requests */}
            <FlatList
              data={adminRequests}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const user = adminRequestsUsers[item.fromUserId];
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedRequest({ ...item, user });
                      setShowRequestDetails(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: '#eee',
                    }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#f0f0f0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                      {user?.profileImage ? (
                        <Image
                          source={{ uri: user.profileImage }}
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                        />
                      ) : (
                        <Ionicons name="person" size={32} color={theme.textSecondary} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.textPrimary }}>
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : (user?.name || 'Unknown name')}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                        {user?.email || 'No email'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 24 }}>
                  No requests to admin.
                </Text>
              }
              style={{ maxHeight: 350 }}
            />
            {/* Close modal button */}
            <TouchableOpacity
              style={{
                marginTop: 18,
                backgroundColor: theme.primary,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center'
              }}
              onPress={() => setAdminRequestsModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Request details modal */}
      <Modal
        visible={showRequestDetails && !!selectedRequest}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowRequestDetails(false);
          setSelectedRequest(null);
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxHeight: '85%',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: theme.textPrimary }}>
              Request details
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {/* User info */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {selectedRequest?.user?.profileImage ? (
                  <Image
                    source={{ uri: selectedRequest.user.profileImage }}
                    style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 8 }}
                  />
                ) : (
                  <Ionicons name="person" size={56} color={theme.textSecondary} style={{ marginBottom: 8 }} />
                )}
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.textPrimary }}>
                  {selectedRequest?.user?.firstName && selectedRequest?.user?.lastName
                    ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`
                    : (selectedRequest?.user?.name || 'Unknown name')}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 15 }}>
                  {selectedRequest?.user?.email || 'No email'}
                </Text>
              </View>
              {/* Doctor request details */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>CUIM:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.cuim || 'N/A'}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>Specialization:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.specializationType || 'N/A'}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>Studies:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.studies || 'N/A'}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>Institutions:</Text>
                <Text style={{ color: theme.textSecondary }}>
                  {formData?.institutions && formData.institutions.length > 0
                    ? formData.institutions.map((inst: any) =>
                        typeof inst === 'string'
                          ? inst
                          : inst.name || inst.address || 'Institution'
                      ).join(', ')
                    : 'N/A'}
                </Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>Biography:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.biography || 'N/A'}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>City:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.city || 'N/A'}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>Years of experience:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.experienceYears || 'N/A'}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>CAS contract:</Text>
                <Text style={{ color: theme.textSecondary }}>{formData?.hasCAS ? 'Yes' : 'No'}</Text>
              </View>
            </ScrollView>
            {/* Accept/Reject buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#ff4444',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginRight: 8,
                }}
                onPress={() => handleRejectRequest(selectedRequest)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginLeft: 8,
                }}
                onPress={() => handleAcceptRequest(selectedRequest)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Accept</Text>
              </TouchableOpacity>
            </View>
            {/* Close details modal */}
            <TouchableOpacity
              style={{
                marginTop: 14,
                alignItems: 'center'
              }}
              onPress={() => {
                setShowRequestDetails(false);
                setSelectedRequest(null);
              }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            {/* Remove doctor button (top right corner) */}
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
                  'Confirmation',
                  'Are you sure you want to remove the doctor status?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => handleRemoveDoctor(doctor.id),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="close-circle" size={24} color={theme.primary} />
            </TouchableOpacity>

            {/* Doctor profile image or placeholder */}
            {doctor.profileImage ? (
              <Image
                source={{ uri: doctor.profileImage }}
                style={styles.doctorImagePlaceholder}
              />
            ) : (
              <View style={styles.doctorImagePlaceholder}>
                <Ionicons name="person" size={40} color={theme.textSecondary} />
              </View>
            )}

            {/* Doctor info */}
            <View style={styles.doctorInfo}>
              <Text style={[styles.doctorName, { color: theme.textPrimary }]}>
                {`Dr. ${doctor.lastName || ''} ${doctor.firstName || ''}`.trim() || doctor.name || doctor.username}
              </Text>
              <Text style={[styles.doctorSpecialty, { color: theme.textSecondary }]}>
                {doctor.specializationType || 'Unknown specialization'}
              </Text>
              {/* Show clinics as comma-separated names, even if array contains objects */}
              <Text style={[styles.doctorClinic, { color: theme.textSecondary }]}>
                {doctor.institutions && doctor.institutions.length > 0
                  ? doctor.institutions
                      .map((inst: any) =>
                        typeof inst === 'string'
                          ? inst
                          : inst.name || inst.address || 'Institution'
                      )
                      .join(', ')
                  : 'No clinic'}
              </Text>
              <Text style={[styles.doctorExperience, { color: theme.textSecondary }]}>
                Experience: {doctor.experienceYears ? `${doctor.experienceYears} years` : 'N/A'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Edit doctor modal */}
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
        selectedUser={editDoctor}
      />

      {/* Promote user to doctor modal */}
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

// Styles for the admin doctors screen
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  statsCircle: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statsLabel: {
    fontSize: 13,
    textAlign: 'center',
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
