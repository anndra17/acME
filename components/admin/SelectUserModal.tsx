import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, AppUser } from '../../lib/firebase-service';

interface SelectUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (user: AppUser) => void;
}

export const SelectUserModal: React.FC<SelectUserModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      // Filter out users that are already doctors
      const regularUsers = allUsers.filter(user => !user.roles?.includes('doctor'));
      setUsers(regularUsers);
      setError(null);
    } catch (err) {
      setError('Nu am putut încărca lista de utilizatori.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Selectează Utilizator
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: theme.textInputBackground,
              color: theme.textPrimary,
              borderColor: theme.border
            }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Caută după nume sau email"
            placeholderTextColor={theme.textSecondary}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : error ? (
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          ) : (
            <ScrollView style={styles.userList}>
              {filteredUsers.length === 0 ? (
                <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                  Nu s-au găsit utilizatori.
                </Text>
              ) : (
                filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.userItem, { borderColor: theme.border }]}
                    onPress={() => onSelect(user)}
                  >
                    <View style={styles.userInfo}>
                      <Text style={[styles.username, { color: theme.textPrimary }]}>
                        {user.username}
                      </Text>
                      <Text style={[styles.email, { color: theme.textSecondary }]}>
                        {user.email}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
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
  closeButton: {
    padding: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  userList: {
    flex: 1,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
}); 