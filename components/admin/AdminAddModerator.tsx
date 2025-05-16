import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { Colors } from "../../constants/Colors";
// import { addModerator } from "../../lib/firebase-service";

export default function AdminAddModerator() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAdd = async () => {
    if (!email || !username || !password) {
      Alert.alert("Toate câmpurile sunt obligatorii!");
      return;
    }
    // await addModerator(email, username, password);
    Alert.alert("Moderator adăugat!");
    setEmail(""); setUsername(""); setPassword("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adaugă Moderator</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Parolă"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Adaugă Moderator" color={Colors.light.primary} onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.light.background },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: Colors.light.primary },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: Colors.light.textInputBackground,
  },
});
