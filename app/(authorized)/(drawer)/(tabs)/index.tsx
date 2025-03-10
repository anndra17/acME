import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSession } from "@/../context";
import { router } from "expo-router";

/**
 * TabsIndexScreen displays the main home screen content with personalized welcome message
 * @returns {JSX.Element} Home screen component
 */
const TabsIndexScreen = () => {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { signOut, user } = useSession();

  // ============================================================================
  // Handlers
  // ============================================================================
  
  /**
   * Handles the logout process
   */
  const handleLogout = async () => {
    await signOut();
    router.replace("/login/sign-in");
  };

  // ============================================================================
  // Computed Values
  // ============================================================================
  
  /**
   * Gets the display name for the welcome message
   * Prioritizes user's name, falls back to email, then default greeting
   */
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';

  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <View style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>
      
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937", // text-gray-800
    marginBottom: 8,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB", // text-blue-600
  },
  emailText: {
    fontSize: 14,
    color: "#6B7280", // text-gray-500
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: "#EF4444", // bg-red-500
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});


export default TabsIndexScreen;