import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { AppUser, getAllDoctors, getSentConnectionRequests, hasAssociatedDoctor, getAssociatedDoctorId, getDoctorProfile, sendConnectionRequest, getPatientTreatments, sendQuestionToDoctor, getQuestionsAndAnswers } from "../../../lib/firebase-service";
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
  const [hasDoctor, setHasDoctor] = useState(false);
  const [loadingDoctorStatus, setLoadingDoctorStatus] = useState(true);
  const [doctor, setDoctor] = useState<AppUser | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [askModalVisible, setAskModalVisible] = useState(false); // pentru modalul de întrebări
  const [question, setQuestion] = useState("");
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false);

  useEffect(() => {
    const checkDoctor = async () => {
      if (user?.uid) {
        setLoadingDoctorStatus(true);
        const result = await hasAssociatedDoctor(user.uid);
        setHasDoctor(result);
        setLoadingDoctorStatus(false);
      }
    };
    checkDoctor();
  }, [user?.uid]);

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

  useEffect(() => {
    const fetchDoctor = async () => {
      if (user?.uid && hasDoctor) {
        setLoadingDoctor(true);
        const doctorId = await getAssociatedDoctorId(user.uid);
        if (doctorId) {
          const doctorProfile = await getDoctorProfile(doctorId);
          setDoctor(doctorProfile);
        }
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [user?.uid, hasDoctor]);

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

  useEffect(() => {
    const fetchTreatments = async () => {
      if (user?.uid && hasDoctor) {
        setLoadingTreatments(true);
        try {
          const data = await getPatientTreatments(user.uid);
          setTreatments(data);
        } catch (e) {
          // poți adăuga un mesaj de eroare aici
        } finally {
          setLoadingTreatments(false);
        }
      }
    };
    fetchTreatments();
  }, [user?.uid, hasDoctor]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (user?.uid && hasDoctor) {
        setLoadingQuestions(true);
        try {
          const data = await getQuestionsAndAnswers(user.uid);
          setQuestions(data);
        } catch (e) {
          // poți adăuga un mesaj de eroare aici
        } finally {
          setLoadingQuestions(false);
        }
      }
    };
    fetchQuestions();
  }, [user?.uid, hasDoctor, askModalVisible]);

  const openQuestionsModal = () => {
    setQuestionsModalVisible(true);
  };

  if (loadingDoctorStatus) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (hasDoctor) {
    if (loadingDoctor) {
      return <View style={styles.container}><Text>Loading doctor...</Text></View>;
    }
    return (
      <View style={[styles.container, { paddingBottom: 0 }]}>
        {/* Cardul medicului SUS */}
        <View
          style={{
            width: "100%",
            paddingVertical: 24,
            paddingHorizontal: 16,
            backgroundColor: "#fff",
            borderRadius: 20,
            marginBottom: 32,
            marginTop: 8,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {/* Numele clinicii - stânga */}
            <View style={{ flex: 1, alignItems: "center", paddingRight: 8 }}>
              <Ionicons name="business-outline" size={18} color={Colors.light.primary} style={{ marginRight: 6 }} />
              <Text style={{ fontWeight: "bold", color: Colors.light.primary, fontSize: 15, textAlign: "right" }}>
                {doctor?.institutions?.[0] || "Nespecificat"}
              </Text>
            </View>
            {/* Poza doctorului - centru */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: "#eee",
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: Colors.light.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                {doctor?.profileImage ? (
                  <Image source={{ uri: doctor.profileImage }} style={{ width: 84, height: 84, borderRadius: 42 }} />
                ) : (
                  <Ionicons name="person-circle-outline" size={84} color={Colors.light.primary} />
                )}
              </View>
              <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 8, textAlign: "center" }}>
                Dr. {doctor?.firstName || ""} {doctor?.lastName || doctor?.username || doctor?.email}
              </Text>
            </View>
            {/* Tipul doctorului - dreapta */}
            <View style={{ flex: 1, alignItems: "center", paddingLeft: 8 }}>
              <Ionicons name="medkit-outline" size={18} color={Colors.light.primary} style={{ marginRight: 6 }} />
              <Text style={{ fontWeight: "bold", color: Colors.light.primary, fontSize: 15, textAlign: "center" }}>
                {doctor?.specializationType
                  ? `Medic ${doctor.specializationType.charAt(0).toUpperCase() + doctor.specializationType.slice(1)}`
                  : "Tip nespecificat"}
              </Text>
            </View>
          </View>
        </View>

        {/* Cardul cu tratamente - ocupă spațiul rămas */}
        <View style={{ flex: 1, width: "100%", justifyContent: "flex-start" }}>
          {/* Card cu tratamentele prescrise */}
          <View
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 18,
              marginTop: 0,
              marginBottom: 24,
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              maxHeight: 250, // Limitează înălțimea cardului
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 18, color: Colors.light.primary, marginBottom: 10 }}>
              Prescribed Treatments
            </Text>
            {loadingTreatments ? (
              <Text>Loading treatments...</Text>
            ) : treatments.length === 0 ? (
              <Text style={{ color: "#888" }}>No treatments prescribed yet.</Text>
            ) : (
              <FlatList
                data={treatments}
                keyExtractor={(item, idx) => item.id || idx.toString()}
                style={{ maxHeight: 170 }}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16, color: Colors.light.textPrimary }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: Colors.light.textSecondary, marginTop: 2 }}>
                      <Text style={{ fontWeight: "bold" }}>Instructions: </Text>
                      {item.instructions || "-"}
                    </Text>
                    {item.notes ? (
                      <Text style={{ color: Colors.light.textSecondary, marginTop: 2 }}>
                        <Text style={{ fontWeight: "bold" }}>Notes: </Text>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            )}
          </View>
        </View>

        {/* Butoanele jos */}
        <View style={{ width: "100%", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            style={[styles.button, { marginBottom: 12 }]}
            onPress={() => setAskModalVisible(true)}
          >
            <Text style={styles.buttonText}>Ask your doctor a question</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openQuestionsModal}
            style={{ marginBottom: 0, alignSelf: "center" }}
            disabled={questions.length === 0}
          >
            <Text style={{
              color: Colors.light.primary,
              fontWeight: "bold",
              fontSize: 16,
              textDecorationLine: questions.length > 0 ? "underline" : "none",
              opacity: questions.length > 0 ? 1 : 0.5,
            }}>
              See answers
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

      <Modal
        visible={questionsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuestionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>All Q&amp;A with your doctor</Text>
            <ScrollView style={{ maxHeight: 350, width: "100%" }}>
              {questions.length === 0 ? (
                <Text style={{ color: "#888" }}>No questions sent yet.</Text>
              ) : (
                questions.map((q, idx) => (
                  <View
                    key={q.id || idx}
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      backgroundColor: "#f7f7fa",
                      padding: 14,
                      borderWidth: 1,
                      borderColor: "#e0e0e0",
                      shadowColor: "#000",
                      shadowOpacity: 0.04,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", color: Colors.light.textPrimary, marginBottom: 4 }}>
                      Q: {q.question}
                    </Text>
                    {q.answer ? (
                      <Text style={{ color: Colors.light.primary, marginTop: 4 }}>
                        <Text style={{ fontWeight: "bold" }}>A: </Text>
                        {q.answer}
                      </Text>
                    ) : (
                      <Text style={{ color: "#888", marginTop: 4, fontStyle: "italic" }}>No answer yet.</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setQuestionsModalVisible(false)} style={[styles.button, { marginTop: 16 }]}>
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