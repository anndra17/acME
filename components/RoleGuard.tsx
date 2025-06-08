import { useRouter } from "expo-router";
import { useSession } from "@/../context";
import { useEffect } from "react";
import { ReactNode } from "react";
import { View, Text, StyleSheet } from 'react-native';

interface RoleBasedScreenProps  {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleBasedScreenProps ) {
  const { user, userRole, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("RoleGuard - userRole:", userRole); 
    if (!isLoading && (!user || !userRole)) {
      router.replace("/login/sign-in");
    }
  }, [user, userRole, isLoading, router]);

  if (isLoading) return null; // sau un loader

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return fallback || null;
  }

  return <>{children}</>;
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});