import { useSession } from "@/../context";
import { useState, useEffect } from "react";
import React from "react";
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from "react-native";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./../../../lib/firebase-config";
import Button from "../../../components/Button";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { useColorScheme } from "react-native";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = Math.round(width * 0.22); // ~22% din lățimea ecranului
const CARD_PADDING = Math.round(width * 0.06); // ~6% padding
const CARD_RADIUS = Math.round(width * 0.045); // ~4.5% border radius

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const { user, signOut } = useSession();
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
          setProfileImage(userData.profileImage || null);
        } else {
          setDateOfBirth(null);
          setProfileImage(null);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login/sign-in");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          shadowColor: theme.textPrimary,
          padding: CARD_PADDING,
          borderRadius: CARD_RADIUS,
          width: width > 400 ? 400 : "100%",
        }
      ]}>
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={[styles.avatar, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}
            />
          ) : (
            <View style={[
              styles.avatar,
              {
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: theme.primary + "22",
                justifyContent: "center",
                alignItems: "center"
              }
            ]}>
              <Ionicons name="person" size={Math.round(AVATAR_SIZE * 0.6)} color={theme.primary} />
            </View>
          )}
        </View>
        <Text style={[styles.displayName, { color: theme.textPrimary, fontSize: Math.round(width * 0.055) }]}>
          {displayName}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary, fontSize: Math.round(width * 0.04) }]}>
          <Ionicons name="mail" size={16} color={theme.textSecondary} /> {user?.email}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary, fontSize: Math.round(width * 0.038) }]}>
            Data nașterii: {dateOfBirth || "Nespecificat"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary, fontSize: Math.round(width * 0.038) }]}>
            Ultima autentificare: {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary, fontSize: Math.round(width * 0.038) }]}>
            Cont creat: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
          </Text>
        </View>
      </View>
      <View style={{ width: width > 400 ? 400 : "100%", paddingHorizontal: CARD_PADDING, marginTop: 32 }}>
        <Button label="Logout" onPress={handleLogout} type="primary" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#eee",
  },
  displayName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  email: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 6,
  },
});

export default ProfileScreen;