import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Switch } from "react-native";
import { addModerator, addDoctor } from "../../lib/firebase-service"; // funcții pe care le vei crea

export default function AdminDashboard() {
  // State pentru formularul de moderator
  const [modEmail, setModEmail] = useState("");
  const [modUsername, setModUsername] = useState("");
  const [modPassword, setModPassword] = useState("");

  // State pentru formularul de doctor
  const [doctorName, setDoctorName] = useState("");
  const [doctorSurname, setDoctorSurname] = useState("");
  const [doctorCode, setDoctorCode] = useState("");
  const [doctorExperience, setDoctorExperience] = useState("");
  const [doctorClinics, setDoctorClinics] = useState("");
  const [doctorCAS, setDoctorCAS] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorUsername, setDoctorUsername] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      {/* Adaugă moderator */}
      <Text style={styles.sectionTitle}>Adaugă Moderator</Text>
      <TextInput placeholder="Email" value={modEmail} onChangeText={setModEmail} style={styles.input} />
      <TextInput placeholder="Username" value={modUsername} onChangeText={setModUsername} style={styles.input} />
      <TextInput placeholder="Parolă" value={modPassword} onChangeText={setModPassword} style={styles.input} secureTextEntry />
      <Button title="Adaugă Moderator" onPress={() => addModerator(modEmail, modUsername, modPassword)} />

      {/* Adaugă doctor */}
      <Text style={styles.sectionTitle}>Adaugă Doctor</Text>
      <TextInput placeholder="Nume" value={doctorName} onChangeText={setDoctorName} style={styles.input} />
      <TextInput placeholder="Prenume" value={doctorSurname} onChangeText={setDoctorSurname} style={styles.input} />
      <TextInput placeholder="Cod doctor" value={doctorCode} onChangeText={setDoctorCode} style={styles.input} />
      <TextInput placeholder="Ani experiență" value={doctorExperience} onChangeText={setDoctorExperience} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Clinici (virgulă între ele)" value={doctorClinics} onChangeText={setDoctorClinics} style={styles.input} />
      <View style={styles.row}>
        <Text>Contract CAS</Text>
        <Switch value={doctorCAS} onValueChange={setDoctorCAS} />
      </View>
      <Button
        title="Adaugă Doctor"
        onPress={() =>
          addDoctor({
            name: doctorName,
            surname: doctorSurname,
            code: doctorCode,
            experience: doctorExperience,
            clinics: doctorClinics.split(","),
            hasCAS: doctorCAS,
            email: doctorEmail,
            password: doctorPassword,
            username: doctorUsername,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
});
