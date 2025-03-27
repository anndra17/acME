import { useSession } from "@/../context";
import {useState, useEffect} from 'react';
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./../../../lib/firebase-config"; // Adjust the path as needed




const ProfileScreen = () => {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { user, signOut } = useSession();
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Gets the display name for the welcome message
   * Prioritizes user's name, falls back to email, then default greeting
   */
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Guest";

    useEffect(() => {
      const fetchUserData = async () => {
        if (user) {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setDateOfBirth(userData.dateOfBirth || null);
          } else {
            console.log("No such document!");
            setDateOfBirth(null); // Or set to a default value if needed
          }
        }
      };
  
      fetchUserData();
    }, [user]); // Dependency array ensures effect runs when 'user' changes

  /**
     * Handles the logout process
     */
    const handleLogout = async () => {
      await signOut();
      router.replace("/login/sign-in");
  };
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
        <Text style={styles.creationTime}>
          Date of Birth: {dateOfBirth || "Not specified"}
        </Text>
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
      marginTop: 16,
      padding: 16,
    },
    section: {
      marginBottom: 32,
    },
    displayName: {
      fontSize: 20,
      fontWeight: "bold",
    },
    email: {
      fontSize: 20,
      fontWeight: "600", // font-semibold
      marginTop: 8,
    },
    lastSignIn: {
      fontSize: 16, // text-normal
      fontWeight: "600", // font-semibold
      marginTop: 8,
    },
    creationTime: {
      fontSize: 16, // text-normal
      fontWeight: "600", // font-semibold
      marginTop: 8,
    },
    logoutText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    logoutButton: {
      backgroundColor: "#EF4444", // bg-red-500
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },  
  });
  

export default ProfileScreen;