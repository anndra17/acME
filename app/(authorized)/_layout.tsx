import { Stack } from 'expo-router';
import { useSession } from '@/../context';
import RoleGuard from '../../components/RoleGuard';
import UnauthorizedScreen from '../unauthorized'; // importă componenta

/**
 * AppLayout serves as the root authentication wrapper for the main app routes.
 * It ensures:
 * 1. Protected routes are only accessible to authenticated users
 * 2. Loading states are handled appropriately
 * 3. Unauthenticated users are redirected to sign-in
 *
 * This layout wraps all routes within the (app) directory, but not (auth) routes,
 * allowing authentication flows to remain accessible.
 */
export default function AuthorizedLayout() {
  console.log("Sunt in layout: /(authorized)/_layout.tsx");


  return (
    <RoleGuard
      allowedRoles={['user', 'admin', 'moderator', 'doctor']}
      fallback={<UnauthorizedScreen />} // fallback explicit pentru useri dezactivați
    >
      <Stack>
        <Stack.Screen
          name="(drawer)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="admin"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </RoleGuard>
  );
}