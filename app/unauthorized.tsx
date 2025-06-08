import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

const UnauthorizedScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/login/sign-in");
    }, 2500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>
        Your account has been deactivated and you cannot access this page.
      </Text>
      <Text style={styles.message}>
        Redirecting to sign in...
      </Text>
      <ActivityIndicator size="large" color="#b71c1c" style={{ marginTop: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#b71c1c",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
});

export default UnauthorizedScreen;