import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/../lib/firebase-config";
import { Colors} from "../../constants/Colors";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // For success/failure message
  const [error, setError] = useState(""); // For error message

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
      setError("");
    } catch (err) {
      setError("Error sending password reset email. Please try again.");
      setMessage("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Forgot Password</Text>
        <Text style={styles.welcomeSubtitle}>
          Enter your email to reset your password
        </Text>
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
      </View>

      {/* Message Section */}
      {message ? (
        <Text style={styles.successMessage}>{message}</Text>
      ) : null}
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

      {/* Reset Password Button */}
      <Pressable onPress={handleResetPassword} style={styles.button}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </Pressable>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Remember your password?</Text>
        <Link href="./sign-in" asChild>
          <Pressable>
            <Text style={styles.signInLink}>Sign In</Text>
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.mainColor,
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
  successMessage: {
    color: "#16a34a", // text-green-500
    textAlign: "center",
    marginVertical: 8,
  },
  errorMessage: {
    color: "#ef4444", // text-red-500
    textAlign: "center",
    marginVertical: 8,
  },
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  signInText: {
    color: "#4b5563", // text-gray-600
  },
  signInLink: {
    color:  Colors.light.mainColor,
    fontWeight: "600",
    marginLeft: 8,
  },
});
