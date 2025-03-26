import { router, Link } from "expo-router";
import { Text, View, Pressable, StyleSheet, useColorScheme } from "react-native";
import { useState } from "react";
import { useSession } from "@/../context";
import { Colors} from "../../constants/Colors";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import PasswordInput from "../../components/PasswordInput"; 
import DatePickerInput from "../../components/DatePickerInput";


export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const { signUp } = useSession();
  
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];

  const handleRegister = async () => {
    try {
      return await signUp(email, password, name, username, dateOfBirth ? dateOfBirth.toISOString() : undefined);
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
        <Text style={[styles.title, {color: theme.title}]}>Create Account</Text>
        <Text style={[styles.subtitle, {color: theme.textPrimary}]}>Sign up to get started</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
      <TextInput  label="Name"
                  placeholder="Your full name"
                  value={name}
                  onChangeText={setName}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="person"
                />

      <TextInput label="Email"
                  placeholder="name@mail.com"
                  value={email}
                  onChangeText={setEmail}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail"
                />

      <TextInput label="Username"
                  placeholder="Create an username"
                  value={username}
                  onChangeText={setUsername}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="happy"
                />
      
      <DatePickerInput
                    label="Date of Birth"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                />

      <PasswordInput label="Password"
                      placeholder="Your password"
                      value={password}
                      onChangeText={setPassword}
                      textContentType="password"
                    />
      </View>

      {/* Sign Up Button */}
      <Button title="Sign up" onPress={handleSignUpPress}  style={{maxWidth: 300, width: "100%", height: '8%'}}/>

      {/* Sign In Link */}
      <View style={styles.signInLink}>
        <Text style={{color: theme.textSecondary}}>Already have an account?</Text>
        <Link href="./sign-in" asChild>
          <Pressable>
            <Text style={[styles.signInText, {color: theme.link}]}>Sign In</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 32,
    gap: 20
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
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  signInLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  signInText: {
    fontWeight: "600",
    marginLeft: 8,
  },
});
