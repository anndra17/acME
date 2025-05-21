import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import RoleGuard from '../../../../components/RoleGuard';
import { useSession } from '@/../context';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { userRole } = useSession();

  console.log("AdminDashboard - Current user role:", userRole);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Admin Dashboard</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Welcome to the admin dashboard. Here you can manage users and application settings.
        </Text>
        <Text style={[styles.roleInfo, { color: theme.textSecondary }]}>
          Current role: {userRole}
        </Text>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  roleInfo: {
    fontSize: 14,
    marginTop: 10,
  },
}); 