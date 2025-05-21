import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import RoleGuard from '../../../../components/RoleGuard';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../../lib/firebase-config';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserManagement() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>User Management</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.userCard, { backgroundColor: theme.primary}]}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
              <Text style={[styles.userRole, { color: theme.textSecondary }]}>Role: {item.role}</Text>
            </View>
          )}
        />
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 5,
  },
  userRole: {
    fontSize: 14,
    marginTop: 5,
  },
}); 