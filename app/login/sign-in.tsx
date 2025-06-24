import { router, Link } from "expo-router";
import { Text, View, Pressable, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";
import { Colors} from "../../constants/Colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput"; 
import PasswordInput from "../../components/PasswordInput";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { ensureDefaultField } from "../../lib/firebase-service";
const defaultImageUrl = 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdefault_profile.png?alt=media&token=9c6839ea-13a6-47de-b8c5-b0d4d6f9ec6a';
const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdefault-cover.png?alt=media&token=fe90025f-4eea-4a71-8344-256d2c4982e8';
  

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, reloadUser  } = useSession();
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"]; 


  const handleSignInPress = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
    setError("Please fill in both email and password.");
    return;
  }
    try {
      const auth = getAuth();
      const userCredentials = await signInWithEmailAndPassword(auth, email,password);
      const user = userCredentials.user;
      
      await ensureDefaultField(user.uid, 'profileImage', defaultImageUrl);
      await ensureDefaultField(user.uid, 'coverImage', defaultCoverUrl);

      // eu am definit reload user asta in context/index
      await reloadUser(); // Reload from Async Storage
      router.replace("../(authorized)/(drawer)/(tabs)/");


     } catch (err: any) {
        const errorCode = err.code || err?.error?.code || err?.toString();

        if (errorCode === 'auth/invalid-credential') {
          setError("Invalid email or password. Please check your credentials.");
        }
        else if (errorCode === 'auth/user-not-found') {
          setError("User not found.");
        }
        else if (errorCode === 'auth/too-many-requests') {
          setError("Too many requests, try again later.");
        }
        else if (errorCode === 'auth/invalid-email') {
          setError("Invalid email format. Please enter a valid email address.");
        }
        else {
          console.error("An unexpected error occurred: ", errorCode);
          setError("An unexpected error occurred. Please try again later.");
        }
    }
  };


  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeTitle, {color: theme.title}]}>Welcome Back</Text>
        <Text style={[styles.welcomeSubtitle,  { color: theme.textPrimary }]}>Please sign in to continue</Text>
      </View>

      <View style={styles.formContainer}>
        
      <TextInput label="Email"
                  placeholder="name@mail.com"
                  value={email}
                  onChangeText={setEmail}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail"
                />

      <PasswordInput label="Password"
                      placeholder="Your password"
                      value={password}
                      onChangeText={setPassword}
                      textContentType="password"
                    />
      </View>

      {error && (
        <View style={[styles.errorContainer,{backgroundColor: theme.errorBackground}]}>
          <Text style={[styles.errorText, {color: theme.errorText}]}>{error}</Text>
        </View>
      )}

      <View style={styles.forgotPasswordContainer}>
        <Link href="./forgot-password" asChild>
          <Pressable>
            <Text style={[styles.forgotPasswordLink, {color: theme.textSecondary}]}>Forgot password?</Text>
          </Pressable>
        </Link>
      </View>

      <Button label="Sign In" onPress={handleSignInPress} type='primary'  />

      <View style={styles.signUpContainer}>
        <Text style={[styles.signUpText, {color: theme.textPrimary}]}>Don't have an account?</Text>
        <Link href="./sign-up" asChild>
          <Pressable>
            <Text style={[styles.signUpLink, {color: theme.link}]}>Sign Up</Text>
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
    welcomeContainer: {
        alignItems: "center",
        marginBottom: 35,
    },
    welcomeTitle: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
    },
    formContainer: {
        width: "100%",
        maxWidth: 300,
        gap: 20,
        marginBottom: 30,
    },
    signUpContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
    },
    signUpText: {
        textAlign: 'center'
    },
    signUpLink: {
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
        marginBottom: 10,
        textAlign: 'center'
    },
    errorContainer: {
        width: "100%",
        maxWidth: 300,
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        textAlign: "center",
    },
});