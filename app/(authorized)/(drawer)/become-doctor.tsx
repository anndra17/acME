import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { useSession } from '../../../context';
import { getUserProfile, AppUser, promoteUserToDoctor } from '../../../lib/firebase-service';
import SpecializationPicker from '../../../components/admin/SpecializationPicker';

export default function BecomeDoctorScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cuim, setCUIM] = useState('');
  const [specializationType, setSpecializationType] = useState<'rezident' | 'specialist' | 'primar'>('rezident');
  const [studies, setStudies] = useState('');
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [institutionInput, setInstitutionInput] = useState('');
  const [biography, setBiography] = useState('');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hasCAS, setHasCAS] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.uid) {
        setLoading(true);
        try {
          const userData = await getUserProfile(user.uid);
          setAppUser({ id: user.uid, ...userData } as AppUser);
        } catch (e) {
          Alert.alert('Eroare', 'Nu am putut încărca datele tale de utilizator.');
        }
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const handleSubmit = async () => {
    if (!appUser) return;
    if (!firstName || !lastName || !cuim || !specializationType || institutions.length === 0) {
      Alert.alert('Eroare', 'Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }
    setLoading(true);
    try {
      const doctorPayload: any = {
        firstName,
        lastName,
        username: appUser.username,
        email: appUser.email,
        cuim,
        specializationType,
        reviews: [],
        approved: false,
        studies,
        institutions,
        biography,
        city,
        hasCAS,
        profileImage: appUser.profileImage || 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdoctor_profile.png?alt=media&token=51735deb-7c17-400c-a23a-89cad2a043b9',
      };
      if (experienceYears) {
        doctorPayload.experienceYears = Number(experienceYears);
      }
      await promoteUserToDoctor(appUser.id, doctorPayload);
      Alert.alert('Succes', 'Cererea ta de a deveni doctor a fost trimisă!');
      // Poți reseta formularul aici dacă vrei
    } catch (err) {
      Alert.alert('Eroare', 'Nu s-a putut trimite cererea.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Devino Doctor
      </Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Completează formularul pentru a trimite o cerere de a deveni doctor în platformă. Un administrator va valida cererea ta.
      </Text>
      {loading && <ActivityIndicator color={theme.primary} />}
      {!loading && (
        <>
          <Text style={{ color: theme.textSecondary, marginBottom: 12, textAlign: 'center' }}>
            Email: <Text style={{ color: theme.textPrimary }}>{appUser?.email}</Text>
          </Text>
          <TextInput
            placeholder="Prenume *"
            placeholderTextColor={theme.textSecondary}
            value={firstName}
            onChangeText={setFirstName}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Nume *"
            placeholderTextColor={theme.textSecondary}
            value={lastName}
            onChangeText={setLastName}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Număr CUIM *"
            placeholderTextColor={theme.textSecondary}
            value={cuim}
            onChangeText={setCUIM}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
            Clinici/Instituții (cel puțin una) *
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TextInput
              placeholder="Adaugă clinică/instituție"
              placeholderTextColor={theme.textSecondary}
              value={institutionInput}
              onChangeText={setInstitutionInput}
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8, backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
            />
            <TouchableOpacity
              onPress={() => {
                if (institutionInput.trim() && !institutions.includes(institutionInput.trim())) {
                  setInstitutions([...institutions, institutionInput.trim()]);
                  setInstitutionInput('');
                }
              }}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Adaugă</Text>
            </TouchableOpacity>
          </View>
          {institutions.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              {institutions.map((inst, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: theme.textPrimary, flex: 1 }}>{inst}</Text>
                  <TouchableOpacity onPress={() => setInstitutions(institutions.filter((_, i) => i !== idx))}>
                    <Text style={{ color: 'red', marginLeft: 8 }}>Șterge</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: 15 }}>
            <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
              Specializare *
            </Text>
            <SpecializationPicker
              value={specializationType}
              onChange={setSpecializationType}
            />
          </View>
          <TextInput
            placeholder="Facultate și an finalizare (opțional)"
            placeholderTextColor={theme.textSecondary}
            value={studies}
            onChangeText={setStudies}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Biografie (max 500 caractere) (opțional)"
            placeholderTextColor={theme.textSecondary}
            value={biography}
            onChangeText={setBiography}
            multiline
            maxLength={500}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border, height: 80 }]}
          />
          <TextInput
            placeholder="Oraș (opțional)"
            placeholderTextColor={theme.textSecondary}
            value={city}
            onChangeText={setCity}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Ani de experiență (opțional)"
            placeholderTextColor={theme.textSecondary}
            value={experienceYears}
            onChangeText={setExperienceYears}
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TouchableOpacity
            style={[
              styles.casButton,
              { backgroundColor: hasCAS ? theme.primary : theme.textInputBackground, borderColor: theme.border }
            ]}
            onPress={() => setHasCAS(!hasCAS)}
          >
            <Text style={{
              color: hasCAS ? 'white' : theme.textPrimary,
              fontWeight: 'bold',
            }}>
              Are contract cu CAS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary, marginTop: 16 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              Trimite cerere
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 400,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
  },
  casButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
});