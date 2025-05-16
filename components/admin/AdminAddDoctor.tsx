import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from "react-native";
import { Colors } from "../../constants/Colors";
// import { addDoctor } from "../../lib/firebase-service";

export default function AdminAddDoctor() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [code, setCode] = useState("");
  const [experience, setExperience] = useState("");
  const [clinics, setClinics] = useState("");
  const [hasCAS, setHasCAS] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleAdd = async () => {
    if (!name || !surname || !code || !experience || !clinics || !email || !password || !username) {
      Alert.alert("Toate câmpurile sunt obligatorii!");
      return;
    }
    // await addDoctor({ name, surname, code, experience, clinics: clinics.split(","), hasCAS, email, password, username });
    Alert.alert("Doctor adăugat!");
    setName(""); setSurname(""); setCode(""); setExperience(""); setClinics(""); setHasCAS(false); setEmail(""); setPassword(""); setUsername("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adaugă Doctor</Text>
      <TextInput placeholder="Nume" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Prenume" value={surname} onChangeText={setSurname} style={styles.input} />
      <TextInput placeholder="Cod doctor" value={code} onChangeText={setCode} style={styles.input} />
      <TextInput placeholder="Ani experiență" value={experience} onChangeText={setExperience} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Clinici (virgulă între ele)" value={clinics} onChangeText={setClinics} style={styles.input} />
      <View style={styles.row}>
        <Text>Contract CAS</Text>
        <Switch value={hasCAS} onValueChange={setHasCAS} />
      </View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Parolă" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Adaugă Doctor" color={Colors.light.primary} onPress={handleAdd} />
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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
});
