import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();

  const handleLogin = async () => {
    try {
      return await signIn(email, password);
    } catch (err) {
      console.log("[handleLogin] ==>", err);
      return null;
    }
  };

  const handleSignInPress = async () => {
    const resp = await handleLogin();
    router.replace("./(authorized)/(drawer)/(tabs)/");
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeSubtitle}>Please sign in to continue</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="name@mail.com"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            style={styles.input}
          />
        </View>
      </View>

      {/* Sign In Button */}
      <Pressable onPress={handleSignInPress} style={styles.button}>
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <Link href="./sign-up" asChild>
          <Pressable>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

// ================== STILURI ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937", // text-gray-800
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6b7280", // text-gray-500
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151", // text-gray-700
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db", // border-gray-300
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#2563eb", // bg-blue-600
    width: "100%",
    maxWidth: 300,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  signUpText: {
    color: "#4b5563", // text-gray-600
  },
  signUpLink: {
    color: "#2563eb", // text-blue-600
    fontWeight: "600",
    marginLeft: 8,
  },
});
