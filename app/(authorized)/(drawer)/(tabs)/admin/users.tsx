import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors } from '../../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { getAllUsers, AppUser, updateUser, deleteUser } from '../../../../../lib/firebase-service';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 coloane cu padding de 16px pe fiecare parte și 16px între ele
const CARD_HEIGHT = height * 0.18; // 18% din înălțimea ecranului

const AdminManageUsers = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<AppUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Eroare', 'Nu am putut încărca lista de utilizatori.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: AppUser) => {
    setSelectedUser(user);
    setEditedUser(user);
    setModalVisible(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedUser || !selectedUser) return;
    
    try {
      await updateUser(selectedUser.id, {
        username: editedUser.username,
        email: editedUser.email,
      });
      
      setIsEditing(false);
      setModalVisible(false);
      fetchUsers(); // Reîmprospătează lista de utilizatori
      Alert.alert('Succes', 'Modificările au fost salvate!');
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut salva modificările.');
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    Alert.alert(
      'Confirmare',
      'Sigur doriți să ștergeți acest utilizator? Această acțiune nu poate fi anulată.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(selectedUser.id);
              setModalVisible(false);
              fetchUsers(); // Reîmprospătează lista de utilizatori
              Alert.alert('Succes', 'Utilizatorul a fost șters!');
            } catch (error) {
              Alert.alert('Eroare', 'Nu am putut șterge utilizatorul.');
              console.error('Error deleting user:', error);
            }
          },
        },
      ]
    );
  };

  const calculateDaysSinceJoin = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate number of regular users (users with only 'user' role)
  const regularUsersCount = users.filter(user => 
    user.userRoles && user.userRoles.length === 1 && user.userRoles[0] === 'user'
  ).length;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.statsContent}>
            <Ionicons name="people" size={32} color={theme.primary} />
            <View style={styles.statsTextContainer}>
              <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
                {regularUsersCount}
              </Text>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Utilizatori obișnuiți
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[styles.userCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleUserPress(user)}
          >
            <View style={styles.avatarContainer}>
              <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.username, { color: theme.textPrimary }]} numberOfLines={1}>
              {user.username}
            </Text>
            <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={1}>
              {user.email}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Detalii Utilizator
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                  <Ionicons name="pencil" size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <Ionicons name="trash" size={24} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody}>
              {isEditing ? (
                <>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.textInputBackground,
                      color: theme.textPrimary,
                      borderColor: theme.border
                    }]}
                    value={editedUser?.username}
                    onChangeText={(text) => setEditedUser(prev => prev ? {...prev, username: text} : null)}
                    placeholder="Username"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.textInputBackground,
                      color: theme.textPrimary,
                      borderColor: theme.border
                    }]}
                    value={editedUser?.email}
                    onChangeText={(text) => setEditedUser(prev => prev ? {...prev, email: text} : null)}
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Salvează</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Username:</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{selectedUser?.username}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Email:</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{selectedUser?.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Postări săptămâna aceasta:</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>0</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Zile în platformă:</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                      {selectedUser ? calculateDaysSinceJoin(selectedUser.joinedAt) : 0}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Prieteni:</Text>
                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>0</Text>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTextContainer: {
    marginLeft: 15,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  userCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
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
  avatarContainer: {
    width: CARD_WIDTH * 0.4,
    height: CARD_WIDTH * 0.4,
    borderRadius: (CARD_WIDTH * 0.4) / 2,
    backgroundColor: '#FFC112',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: CARD_WIDTH * 0.15,
    fontWeight: 'bold',
  },
  username: {
    fontSize: CARD_WIDTH * 0.08,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  email: {
    fontSize: CARD_WIDTH * 0.06,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  modalBody: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminManageUsers;
