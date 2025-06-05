import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { AppUser, getAllDoctors, getSentConnectionRequests, hasPendingConnectionRequest, sendConnectionRequest } from "../../../lib/firebase-service";
import { useSession } from "@/../context"; // ajustează calea dacă e nevoie

function getRelativeTimeString(date: any) {
  // Acceptă Firestore Timestamp sau string
  const now = new Date();
  const postDate = date?.toDate ? date.toDate() : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return 'last week';
  return postDate.toLocaleDateString();
}

const ConnectWithDoctorScreen = () => {
  const { user } = useSession(); // user?.uid este id-ul userului curent
  const [doctorsModalVisible, setDoctorsModalVisible] = useState(false);
  const [doctors, setDoctors] = useState<AppUser[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const handleFindDoctor = async () => {
    setLoadingDoctors(true);
    setDoctorsModalVisible(true);
    try {
      const fetchedDoctors = await getAllDoctors();

      setDoctors(fetchedDoctors);
    } catch (e) {
      // poți adăuga un mesaj de eroare aici
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleRequestConnection = async (doctorId: string) => {
    if (!user?.uid) {
      alert("User not authenticated.");
      return;
    }
    try {
      await sendConnectionRequest(user.uid, doctorId);
      alert("Cererea a fost trimisă!");
    } catch (e) {
      alert("Eroare la trimitere cerere: " + (e as Error).message);
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.uid) return;
      setLoadingRequests(true);
      try {
        const requests = await getSentConnectionRequests(user.uid);
        setSentRequests(requests);
      } catch (e) {
        // poți adăuga un mesaj de eroare aici
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [user?.uid, doctorsModalVisible]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const fetchedDoctors = await getAllDoctors();
        setDoctors(fetchedDoctors);
      } catch (e) {
        // poți adăuga un mesaj de eroare aici
      }
    };
    fetchDoctors();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
        <Ionicons name="medkit-outline" size={64} color={Colors.light.primary} style={styles.icon} />
        <Text style={styles.title}>Connect with a Doctor</Text>
        <Text style={styles.subtitle}>
          Here you will be able to find and connect with a medical professional for advice or consultation.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleFindDoctor}>
          <Text style={styles.buttonText}>Find a Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* Card pentru cereri trimise, mereu jos */}
      <View style={styles.requestsCard}>
        {
          // Filtrăm doar cererile care au toDoctorId
          sentRequests.filter(req => !!req.toDoctorId).length === 0 ? (
            <Text style={styles.requestsCardTitle}>Nicio cerere în așteptare</Text>
          ) : (
            <>
              <Text style={styles.requestsCardTitle}>Cereri trimise către doctori:</Text>
              {loadingRequests ? (
                <Text>Loading...</Text>
              ) : (
                <ScrollView style={{ maxHeight: 120, width: "100%" }}>
                  {sentRequests
                    .filter(req => !!req.toDoctorId)
                    .map(req => {
                      const doctor = doctors.find(d => d.id === req.toDoctorId);
                      return (
                        <View key={req.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                          <Ionicons name="person-circle-outline" size={24} color={Colors.light.primary} style={{ marginRight: 8 }} />
                          <Text>
                            {doctor ? `Dr. ${doctor.username || doctor.email}` : req.toDoctorId} (în așteptare)
                            {" · "}
                            {getRelativeTimeString(req.createdAt)}
                          </Text>
                        </View>
                      );
                    })}
                </ScrollView>
              )}
            </>
          )
        }
      </View>

      <Modal
        visible={doctorsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDoctorsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Doctors</Text>
            {loadingDoctors ? (
              <Text>Loading...</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {doctors.map((doctor) => (
                  <View key={doctor.id} style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: "bold" }}>{doctor.username || doctor.email}</Text>
                    <Text style={{ color: "#666" }}>{doctor.email}</Text>
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 8 }]}
                      onPress={() => handleRequestConnection(doctor.id)}
                      disabled={!user?.uid}
                    >
                      <Text style={styles.buttonText}>Request Connection</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setDoctorsModalVisible(false)} style={[styles.button, { marginTop: 16 }]}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConnectWithDoctorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.light.primary,
  },
  requestsCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: "auto",
    marginBottom: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  requestsCardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: Colors.light.primary,
  },
});