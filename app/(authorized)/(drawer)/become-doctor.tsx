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
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { useSession } from '../../../context';
import { getUserProfile, AppUser, promoteUserToDoctor, sendDoctorRequest } from '../../../lib/firebase-service';
import SpecializationPicker from '../../../components/admin/SpecializationPicker';
import ClinicMapScreen from '../../../components/ClinicMapScreen';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';

const ADMIN_UID = process.env.EXPO_PUBLIC_ADMIN_UID ?? process.env.ADMIN_UID ?? '';

export default function BecomeDoctorScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedClinics, setSelectedClinics] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cuim, setCUIM] = useState('');
  const [specializationType, setSpecializationType] = useState<'rezident' | 'specialist' | 'primar'>('rezident');
  const [studies, setStudies] = useState('');
  const [institutions, setInstitutions] = useState<string[]>([]);
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
          Alert.alert('Error', 'Could not load your user data.');
        }
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

        // Fetch clinics (example: dermatology, you can change the keyword)
        const latitude = loc.coords.latitude;
        const longitude = loc.coords.longitude;
        const radius = 5000;
        const type = 'hospital';
        const keyword = 'dermatology';
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&keyword=${keyword}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
          const formattedClinics = data.results.map((c: any) => ({
            id: c.place_id,
            name: c.name,
            latitude: c.geometry.location.lat,
            longitude: c.geometry.location.lng,
            rating: c.rating || 0,
            user_ratings_total: c.user_ratings_total || 0,
            doctors: [],
            address: c.vicinity || c.formatted_address || '',
          }));
          setClinics(formattedClinics);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async () => {
    if (!appUser) return;
    if (!firstName || !lastName || !cuim || !specializationType || selectedClinics.length === 0) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
    }
    setLoading(true);
    if (ADMIN_UID === '') {
      Alert.alert('Error', 'No admin is configured for approval.');
      setLoading(false);
      return;
    }
    try {
      const formData: any = {
        firstName,
        lastName,
        username: appUser.username,
        email: appUser.email,
        cuim,
        specializationType,
        studies,
        institutions: selectedClinics, // save selected clinics
        biography,
        city,
        hasCAS,
        profileImage: appUser.profileImage,
      };
      if (experienceYears) {
        formData.experienceYears = Number(experienceYears);
      }
      await sendDoctorRequest(appUser.id, ADMIN_UID, formData);
      Alert.alert('Success', 'Your request to become a doctor has been sent to the administrator!');
      // Clear fields after submission
      setFirstName('');
      setLastName('');
      setCUIM('');
      setSpecializationType('rezident');
      setStudies('');
      setSelectedClinics([]);
      setBiography('');
      setCity('');
      setExperienceYears('');
      setHasCAS(false);
    } catch (err) {
      Alert.alert('Error', 'Could not send the request.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Become a Doctor
      </Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Fill in the form to submit a request to become a doctor on the platform. An administrator will validate your request.
      </Text>
      {loading && <ActivityIndicator color={theme.primary} />}
      {!loading && (
        <>
          <Text style={{ color: theme.textSecondary, marginBottom: 12, textAlign: 'center' }}>
            Email: <Text style={{ color: theme.textPrimary }}>{appUser?.email}</Text>
          </Text>
          <TextInput
            placeholder="First Name *"
            placeholderTextColor={theme.textSecondary}
            value={firstName}
            onChangeText={setFirstName}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Last Name *"
            placeholderTextColor={theme.textSecondary}
            value={lastName}
            onChangeText={setLastName}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="CUIM Number *"
            placeholderTextColor={theme.textSecondary}
            value={cuim}
            onChangeText={setCUIM}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
            Clinics/Institutions (at least one) *
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 10,
              width: '100%',
              maxWidth: 400,
              alignSelf: 'center',
            }}
            onPress={() => setShowMap(true)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Add clinic</Text>
          </TouchableOpacity>

          <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
            {location && (
              <ClinicMapScreen
                clinics={clinics}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onClose={() => setShowMap(false)}
                onSelectClinic={(clinic) => {
                  if (!selectedClinics.some((c: any) => c.id === clinic.id)) {
                    setSelectedClinics([...selectedClinics, clinic]);
                  }
                  setShowMap(false);
                }}
              />
            )}
          </Modal>

          {selectedClinics.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
              {selectedClinics.map((clinic, idx) => (
                <View key={idx} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.textInputBackground,
                  borderRadius: 18,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                  alignSelf: 'flex-start',
                  maxWidth: 320,
                }}>
                  <Text style={{
                    color: theme.textPrimary,
                    fontSize: 15,
                    fontWeight: '500',
                    marginRight: 8,
                    maxWidth: 220,
                  }} numberOfLines={1} ellipsizeMode="tail">
                    {clinic.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedClinics(selectedClinics.filter((_, i) => i !== idx))}
                    style={{
                      marginLeft: 2,
                      padding: 2,
                      borderRadius: 12,
                      backgroundColor: '#ff4444',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                    }}
                  >
                    <Text style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 14,
                      lineHeight: 18,
                      textAlign: 'center',
                    }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: 15 }}>
            <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
              Specialization *
            </Text>
            <SpecializationPicker
              value={specializationType}
              onChange={setSpecializationType}
            />
          </View>
          <TextInput
            placeholder="Faculty and graduation year (optional)"
            placeholderTextColor={theme.textSecondary}
            value={studies}
            onChangeText={setStudies}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Biography (max 500 characters) (optional)"
            placeholderTextColor={theme.textSecondary}
            value={biography}
            onChangeText={setBiography}
            multiline
            maxLength={500}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border, height: 80 }]}
          />
          <TextInput
            placeholder="City (optional)"
            placeholderTextColor={theme.textSecondary}
            value={city}
            onChangeText={setCity}
            style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Years of experience (optional)"
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
              Has contract with CAS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary, marginTop: 16 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              Submit request
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