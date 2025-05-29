import { useSession } from "@/../context";
import { Link } from "expo-router";
import React from "react";
import { ReactNode } from "react";
import { View, Text, StyleSheet } from 'react-native';

interface RoleBasedScreenProps  {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleBasedScreenProps ) {
  const { userRole } = useSession();
  console.log("Sunt in RoleGuard, userRole:", userRole);
  console.log("Allowed roles:", allowedRoles);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || (
      <View style={styles.container}>
        <Text style={styles.text}>Access Denied</Text>
        <Text style={styles.subText}>You don't have permission to view this screen.</Text>
        <Link href="/login/sign-in" >
                Return to Home
              </Link>
      </View>
    );
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