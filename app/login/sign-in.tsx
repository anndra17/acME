import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";
import { Ionicons } from "@expo/vector-icons";
import { Colors} from "../../constants/Colors";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useSession();
  const [error, setError] = useState<string | null>(null);

  const handleSignInPress = async () => {
    setError(null); // Clear any previous errors
    try {
      const user = await signIn(email, password); // Get the user object or undefined
      if (user) {
        // Sign-in successful, navigate
        router.replace("../(authorized)/(drawer)/(tabs)/");
      } else {
        // Sign-in failed, set an error message
        setError("Invalid email or password. Please check your credentials.");
      }
    } catch (err: any) {
      //This catch is for other errors not specific to firebase authentication
      console.error("An unexpected error occurred:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeSubtitle}>Please sign in to continue</Text>
      </View>

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
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.forgotPasswordContainer}>
        <Link href="./forgot-password" asChild>
          <Pressable>
            <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
          </Pressable>
        </Link>
      </View>

      <Pressable onPress={handleSignInPress} style={styles.button}>
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6b7280",
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
    color: "#374151",
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
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
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  signUpText: {
    color: "#4b5563",
    textAlign: 'center'
  },
  signUpLink: {
    color:  Colors.light.mainColor,
    fontWeight: "600",
    marginLeft: 8,
    textAlign: 'center'
  },
  forgotPasswordContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "flex-end",
    marginTop: -10,
  },
  forgotPasswordLink: {
    color: "gray",
    marginBottom: 10,
    textAlign: 'center'
  },
  errorContainer: {
    width: "100%",
    maxWidth: 300,
    padding: 10,
    backgroundColor: "#f8d7da",
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#721c24",
    textAlign: "center",
  },
});