import React, { useState } from "react";
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";

interface AddPatientModalProps {
  visible: boolean;
  onClose: () => void;
  doctorId: string;
  onSuccess?: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ visible, onClose, doctorId, onSuccess }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    setIsLoading(true);
    try {
      const q = query(
        collection(firestore, "users"),
        where("email", ">=", search),
        where("email", "<=", search + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(results);
    } catch (err) {
      Alert.alert("Eroare", "A apărut o eroare la căutarea userilor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async (userId: string) => {
    try {
      // Adaugă userId la doctor.patients
      const doctorRef = doc(firestore, "users", doctorId);
      await updateDoc(doctorRef, {
        patients: arrayUnion(userId),
      });
      // Adaugă doctorId la user.doctorIds
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, {
        doctorIds: arrayUnion(doctorId),
      });
      Alert.alert("Succes", "Pacientul a fost adăugat!");
      onSuccess?.();
      onClose();
    } catch (err) {
      Alert.alert("Eroare", "Nu s-a putut adăuga pacientul.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Adaugă pacient
          </Text>
          <TextInput
            placeholder="Caută după email"
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.textInputBackground,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={[styles.searchButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.searchButtonText}>Caută</Text>
          </TouchableOpacity>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.userItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.username, { color: theme.textPrimary }]}>
                    {item.name || item.username || item.email}
                  </Text>
                  <Text style={[styles.email, { color: theme.textSecondary }]}>
                    {item.email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleAddPatient(item.id)}
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.addButtonText}>Adaugă</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.border }]}
          >
            <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>
              Închide
            </Text>
          </TouchableOpacity>
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
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
});