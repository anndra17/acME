import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { signUp } = useSession();

  const handleRegister = async () => {
    try {
      return await signUp(email, password, name);
    } catch (err) {
      console.log("[handleRegister] ==>", err);
      return null;
    }
  };

  const handleSignUpPress = async () => {
    const resp = await handleRegister();
    if (resp) {
      router.replace("../(authorized)/(drawer)/(tabs)/");
    }
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View>
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            textContentType="name"
            autoCapitalize="words"
            style={styles.input}
          />
        </View>

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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            style={styles.input}
          />
        </View>
      </View>

      {/* Sign Up Button */}
      <Pressable onPress={handleSignUpPress} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      {/* Sign In Link */}
      <View style={styles.signInLink}>
        <Text style={styles.linkText}>Already have an account?</Text>
        <Link href="./sign-in" asChild>
          <Pressable>
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A5568",
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#2563EB",
    width: "100%",
    maxWidth: 300,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    // activeOpacity: 0.8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  signInLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  linkText: {
    color: "#4A5568",
  },
  signInText: {
    color: "#2563EB",
    fontWeight: "600",
    marginLeft: 8,
  },
});
