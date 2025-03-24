import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/../lib/firebase-config";
import { Colors } from "../../constants/Colors";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // For success/failure message
  const [error, setError] = useState(""); // For error message

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      setMessage("");
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
        <Text style={[styles.welcomeTitle, {color: theme.title}]}>Forgot Password</Text>
        <Text style={[styles.welcomeSubtitle, {color: theme.textPrimary}]}>
          Enter your email to reset your password
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View>
          <Text style={[styles.label, {color: theme.title}]}>Email</Text>
          <TextInput
            placeholder="name@mail.com"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              {
                borderColor: theme.border, 
                color: theme.textPrimary
              }
            ]}
          />
        </View>
      </View>

      {/* Message Section */}
      {message ? (
        <Text style={[styles.successMessage, {color: theme.succesText, backgroundColor: theme.succesBackground}]}>{message}</Text>
      ) : null}
      {error ? <Text style={[styles.errorMessage, {color: theme.errorText, backgroundColor: theme.errorBackground}]}>{error}</Text> : null}

      {/* Reset Password Button */}
      <Pressable onPress={handleResetPassword} style={[styles.button, {backgroundColor: theme.buttonBackground}]}>
        <Text style={[styles.buttonText, {color: theme.buttonText}]}>Reset Password</Text>
      </Pressable>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text style={{color: theme.textSecondary}}>Remember your password?</Text>
        <Link href="./sign-in" asChild>
          <Pressable>
            <Text style={[styles.signInLink, {color: theme.link}]}>Sign In</Text>
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
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
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
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  successMessage: {
    width: "100%",
    maxWidth: 300,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center'
  },
  errorMessage: {
    width: "100%",
    maxWidth: 300,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center'
  },
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  
  signInLink: {
    fontWeight: "600",
    marginLeft: 8,
  },
});
