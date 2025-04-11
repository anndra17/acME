import { router, Link } from "expo-router";
import { Text, View, Pressable, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";
import { Colors} from "../../constants/Colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput"; 
import PasswordInput from "../../components/PasswordInput";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 


export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, reloadUser  } = useSession();
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"]; // Tema dinamică


  const handleSignInPress = async () => {
    setError(null); // Clear any previous errors
    try {

      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email,password);
      // eu am definit reload user asta in context/index
      await reloadUser(); // Reload from Async Storage
      router.replace("../(authorized)/(drawer)/(tabs)/");


    } catch (err: any) {
        if (err.code === 'auth/invalid-credential') {
          setError("Invalid email or password. Please check your credentials.");
        }
        else if (err.code === 'auth/user-not-found') {
          setError("User not found.");
        }
        else if (err.code === 'auth/too-many-requests') {
          setError("Too many requests, try again later.");
        }

        // Other errors, not specific to firebase auth
        console.error("An unexpected error occurred: ", err);
        setError("An unexpected error occurred.Please try again later.");
    }
    //   const user = await signIn(email, password); // Get the user object or undefined
    //   if (user) {
    //     // Sign-in successful, navigate
    //     router.replace("../(authorized)/(drawer)/(tabs)/");
    //   } else {
    //     // Sign-in failed, set an error message
    //     setError("Invalid email or password. Please check your credentials.");
    //   }
    // } catch (err: any) {
    //   //This catch is for other errors not specific to firebase authentication
    //   console.error("An unexpected error occurred:", err);
    //   setError("An unexpected error occurred. Please try again later.");
    // }
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