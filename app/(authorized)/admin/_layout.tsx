import { Stack } from 'expo-router';
import RoleGuard from '../../../components/RoleGuard';
import { ReactNode } from 'react';

export default function AdminLayout() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Admin Dashboard',
          }}
        />
        <Stack.Screen
          name="users"
          options={{
            title: 'User Management',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Admin Settings',
          }}
        />
      </Stack>
    </RoleGuard>
  );
} 