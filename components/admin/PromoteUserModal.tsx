// PromoteUserModal.tsx

import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";
import { AppUser } from "../../lib/firebase-service";

interface PromoteUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PromoteUserModal: React.FC<PromoteUserModalProps> = ({ visible, onClose, onSuccess }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) {
      // Dacă search este gol, încărcăm toți utilizatorii
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const results: AppUser[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          roles: docSnap.data().roles || ['user']
        })) as AppUser[];
        setUsers(results.filter(user => !user.roles?.includes('moderator')));
      } catch (err) {
        console.error("Eroare încărcare useri:", err);
        Alert.alert("Eroare", "A apărut o eroare la încărcarea userilor.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const q = query(
        collection(firestore, "users"),
        where("username", ">=", search),
        where("username", "<=", search + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results: AppUser[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        roles: docSnap.data().roles || ['user']
      })) as AppUser[];
      setUsers(results.filter(user => !user.roles?.includes('moderator')));
    } catch (err) {
      console.error("Eroare căutare user:", err);
      Alert.alert("Eroare", "A apărut o eroare la căutarea userilor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, {
        roles: arrayUnion("moderator")
      });
      Alert.alert("Succes", "Userul a fost promovat la moderator!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Eroare promovare:", err);
      Alert.alert("Eroare", "Nu s-a putut promova userul.");
    }
  };

  useEffect(() => {
    if (visible) {
      handleSearch(); // Încărcăm toți utilizatorii când se deschide modalul
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Promovează user la moderator
          </Text>

          <TextInput
            placeholder="Caută după username"
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            style={[styles.searchInput, { 
              backgroundColor: theme.textInputBackground,
              color: theme.textPrimary,
              borderColor: theme.border
            }]}
          />

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.userItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.username, { color: theme.textPrimary }]}>{item.username}</Text>
                  <Text style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>
                  <TouchableOpacity
                    onPress={() => handlePromote(item.id)}
                    style={[styles.promoteButton, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.promoteButtonText}>Promovează</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <TouchableOpacity 
            onPress={onClose} 
            style={[styles.closeButton, { backgroundColor: theme.border }]}
          >
            <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>Închide</Text>
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
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    marginBottom: 15,
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
  promoteButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  promoteButtonText: {
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
