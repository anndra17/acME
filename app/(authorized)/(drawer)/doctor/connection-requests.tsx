import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useSession } from "@/../context";
import { getPendingDoctorRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../../../lib/firebase-service';

const ConnectionRequests = () => {
  const { user } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // For modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getPendingDoctorRequests(user.uid).then((reqs) => {
      setRequests(reqs);
      setLoading(false);
    });
  }, [user?.uid]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptConnectionRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      Alert.alert("Success", "The request has been accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "An error occurred while accepting the request.");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectConnectionRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      Alert.alert("Request rejected", "The request has been rejected.");
    } catch {
      Alert.alert("Error", "An error occurred while rejecting the request.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection requests from patients</Text>
      {loading ? (
        <Text style={{ marginTop: 24 }}>Loading...</Text>
      ) : (
        <ScrollView style={{ width: "100%" }}>
          {requests.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 24, textAlign: "center" }}>
              There are no pending connection requests.
            </Text>
          ) : (
            requests.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={styles.card}
                onPress={() => {
                  setSelectedRequest(req);
                  setModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="person-circle-outline" size={36} color={Colors.light.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    {req.fromUserName || req.fromUserUsername}
                  </Text>
                  <Text style={styles.userEmail}>{req.fromUserEmail}</Text>
                </View>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(req.id)}>
                  <Ionicons name="checkmark" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(req.id)}>
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal with patient details */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                {/* Profile picture */}
                {selectedRequest.fromUserProfileImage ? (
                  <Image
                    source={{ uri: selectedRequest.fromUserProfileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Ionicons name="person-circle-outline" size={80} color={Colors.light.primary} style={{ alignSelf: "center" }} />
                )}
                <Text style={styles.modalName}>
                  {selectedRequest.fromUserUsername || selectedRequest.fromUserEmail || selectedRequest.fromUserId}
                </Text>
                <Text style={styles.modalEmail}>{selectedRequest.fromUserEmail}</Text>
                {selectedRequest.fromUserAge !== null && selectedRequest.fromUserAge !== undefined && (
                  <Text style={styles.modalField}>
                    Age: {selectedRequest.fromUserAge}
                  </Text>
                )}
                {/* You can add other fields if you send them */}
                <TouchableOpacity
                  style={[styles.acceptBtn, { alignSelf: "center", marginTop: 18 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConnectionRequests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 18,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.light.primary,
  },
  userEmail: {
    color: "#888",
    fontSize: 13,
    marginBottom: 2,
  },
  acceptBtn: {
    backgroundColor: "#4BB543",
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  rejectBtn: {
    backgroundColor: "#E74C3C",
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    alignSelf: "center",
  },
  modalName: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.light.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  modalEmail: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
  },
  modalField: {
    fontSize: 15,
    color: "#444",
    marginBottom: 4,
    textAlign: "center",
  },
});