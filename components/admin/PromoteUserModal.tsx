// PromoteUserModal.tsx

import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";
import { AppUser, addModeratorRole, addDoctor } from "../../lib/firebase-service";

interface PromoteUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  roleType: 'moderator' | 'doctor';
}

export const PromoteUserModal: React.FC<PromoteUserModalProps> = ({ visible, onClose, onSuccess, roleType }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Suplimentar state for doctor role
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [medicalSchool, setMedicalSchool] = useState('');
  const [specialization, setSpecialization] = useState('specialist');
  const [clinics, setClinics] = useState<string[]>([]);
  const [newClinic, setNewClinic] = useState('');
  const [hasCAS, setHasCAS] = useState(false);


  const handleSearch = async () => {
    if (!search.trim()) {
      // Dacă search este gol, încărcăm toți utilizatorii
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const results: AppUser[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          userRoles: docSnap.data().userRoles || ['user']
        })) as AppUser[];
        setUsers(results.filter(user => !user.userRoles?.includes('moderator')));
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
        userRoles: docSnap.data().userRoles || ['user']
      })) as AppUser[];
      setUsers(results.filter(user => !user.userRoles?.includes('moderator')));
    } catch (err) {
      console.error("Eroare căutare user:", err);
      Alert.alert("Eroare", "A apărut o eroare la căutarea userilor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteModerator = async (userId: string) => {
  try {
    await addModeratorRole(userId);
    Alert.alert("Succes", "Userul a fost promovat la moderator!");
    onSuccess?.();
    onClose();
  } catch (err) {
    Alert.alert("Eroare", "Nu s-a putut promova userul.");
  }
};

const handlePromoteDoctor = async () => {
    if (!selectedUser) return;
    if (!licenseNumber || !experience || !medicalSchool || clinics.length === 0) {
      Alert.alert('Eroare', 'Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }
    try {
      await addDoctor({
        name: selectedUser.name || '',
        code: licenseNumber,
        experience,
        clinics,
        hasCAS,
        email: selectedUser.email,
        password: '', // doar dacă vrei să setezi parolă nouă, altfel adaptează funcția
        username: selectedUser.username,
        //medicalSchool,
        //specialization,
      });
      Alert.alert("Succes", "Userul a fost promovat la doctor!");
      onSuccess?.();
      onClose();
    } catch (err) {
      Alert.alert("Eroare", "Nu s-a putut promova userul la doctor.");
    }
  };

  useEffect(() => {
    if (visible) {
      handleSearch(); // Încărcăm toți utilizatorii când se deschide modalul
    }
  }, [visible]);

  // ...existing code...
return (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {roleType === 'moderator'
            ? 'Promovează user la moderator'
            : 'Promovează user la doctor'}
        </Text>

        {/* Search și listă useri */}
        {!selectedUser && (
          <>
            <TextInput
              placeholder="Caută după username"
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

            {isLoading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.userItem, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.username, { color: theme.textPrimary }]}>
                      {item.username}
                    </Text>
                    <Text style={[styles.email, { color: theme.textSecondary }]}>
                      {item.email}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        roleType === 'moderator'
                          ? handlePromoteModerator(item.id)
                          : setSelectedUser(item)
                      }
                      style={[styles.promoteButton, { backgroundColor: theme.primary }]}
                    >
                      <Text style={styles.promoteButtonText}>
                        {roleType === 'moderator'
                          ? 'Promovează'
                          : 'Selectează'}
                      </Text>
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
          </>
        )}

        {/* Formular suplimentar pentru doctor */}
        {roleType === 'doctor' && selectedUser && (
          <>
            <Text style={{ color: theme.textPrimary, marginBottom: 8 }}>
              Completează datele suplimentare pentru doctor:
            </Text>
            <TextInput
              placeholder="Număr CUIM"
              placeholderTextColor={theme.textSecondary}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <TextInput
              placeholder="Ani de experiență"
              placeholderTextColor={theme.textSecondary}
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            <TextInput
              placeholder="Facultatea de medicină"
              placeholderTextColor={theme.textSecondary}
              value={medicalSchool}
              onChangeText={setMedicalSchool}
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.textInputBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />
            {/* Poți adăuga și alte câmpuri pentru specializare, clinici, CAS etc. */}

            <TouchableOpacity
              onPress={handlePromoteDoctor}
              style={[styles.promoteButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.promoteButtonText}>Oferă rol de doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedUser(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Înapoi</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  </Modal>
);
}

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
