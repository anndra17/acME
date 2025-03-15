import { useSession } from "@/../context";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors} from "../../../constants/Colors";

const ProfileScreen = () => {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { user } = useSession();

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Gets the display name for the welcome message
   * Prioritizes user's name, falls back to email, then default greeting
   */
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Guest";

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={styles.displayName}>
          Name: {displayName}
        </Text>
        <Text style={styles.email}>
          Email: {user?.email}
        </Text>
        <Text style={styles.lastSignIn}>
          Last Seen: {user?.metadata?.lastSignInTime}
        </Text>
        <Text style={styles.creationTime}>
          Created: {user?.metadata?.creationTime}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 16,
      padding: 16,
      backgroundColor: Colors.light.background,
    },
    section: {
      marginBottom: 32,
    },
    displayName: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors.light.mainColor,
    },
    email: {
      fontSize: 20,
      fontWeight: "600", // font-semibold
      color: Colors.light.mainColor,
      marginTop: 8,
    },
    lastSignIn: {
      fontSize: 16, // text-normal
      fontWeight: "600", // font-semibold
      color: Colors.light.mainColor, 
      marginTop: 8,
    },
    creationTime: {
      fontSize: 16, // text-normal
      fontWeight: "600", // font-semibold
      color: Colors.light.mainColor, 
      marginTop: 8,
    },
  });
  

export default ProfileScreen;