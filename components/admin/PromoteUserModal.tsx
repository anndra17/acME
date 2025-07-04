// PromoteUserModal.tsx

import React, { useEffect, useState, useRef } from "react";
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, setDoc } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import { Colors } from "../../constants/Colors";
import SpecializationPicker from '../../components/admin/SpecializationPicker';
import { useColorScheme } from "react-native";
import { AppUser, addModeratorRole, promoteUserToDoctor, addOrUpdateClinic } from "../../lib/firebase-service";
import ClinicMapScreen, { Clinic } from '../../components/ClinicMapScreen';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';

interface PromoteUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  roleType: 'moderator' | 'doctor';
  preselectedUser?: AppUser | null; 
}

export const PromoteUserModal: React.FC<PromoteUserModalProps> = ({
  visible, onClose, onSuccess, roleType, preselectedUser
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(preselectedUser ?? null);

  // Suplimentar state for doctor role
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cuim, setCUIM] = useState('');
  const [specializationType, setSpecializationType] = useState<'rezident' | 'specialist' | 'primar'>('rezident');
  const [studies, setStudies] = useState('');
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [institutionInput, setInstitutionInput] = useState('');  const [biography, setBiography] = useState('');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hasCAS, setHasCAS] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const resetForm = () => {
    setSelectedUser(null);
    setFirstName('');
    setLastName('');
    setCUIM('');
    setSpecializationType('rezident');
    setStudies('');
    setInstitutions([]);
    setInstitutionInput('');
    setBiography('');
    setCity('');
    setExperienceYears('');
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const results: AppUser[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          userRoles: docSnap.data().userRoles || ['user']
        })) as AppUser[];
        setUsers(results.filter(user =>
          !user.userRoles?.includes('moderator') &&
          !user.userRoles?.includes('doctor') &&
          !user.userRoles?.includes('admin') 
        ));
      } catch (err) {
        console.error("Error loading users:", err);
        Alert.alert("Error", "An error occurred while loading users.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const q = query(
        collection(firestore, "users"),
        where("username", ">=", search),
        where("username", "<=", search + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results: AppUser[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        userRoles: docSnap.data().userRoles || ['user']
      })) as AppUser[];
      setUsers(results.filter(user =>
        !user.userRoles?.includes('moderator') &&
        !user.userRoles?.includes('admin')
      ));
    } catch (err) {
      console.error("Error searching users:", err);
      Alert.alert("Error", "An error occurred while searching users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteModerator = async (userId: string) => {
    try {
      await addModeratorRole(userId);
      Alert.alert("Success", "User has been promoted to moderator!");
      onSuccess?.();
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not promote user to moderator.");
    }
  };

  const handlePromoteDoctor = async () => {
    console.log('[PromoteUserModal] handlePromoteDoctor called');
    if (!selectedUser) return;
    if (!firstName || !lastName || !cuim || !specializationType || institutions.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    try {
      const doctorPayload: any = {
        firstName,
        lastName,
        username: selectedUser.username,
        email: selectedUser.email,
        cuim,
        specializationType,
        reviews: [],
        approved: true,
        studies,
        institutions,
        biography,
        city,
        hasCAS,
        profileImage: 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdoctor_profile.png?alt=media&token=51735deb-7c17-400c-a23a-89cad2a043b9',
      };
      if (experienceYears) {
        doctorPayload.experienceYears = Number(experienceYears);
      }

      console.log('[PromoteUserModal] doctorPayload:', doctorPayload);

      // 1. Save/update institutions in Firestore
      for (const inst of institutions) {
        const institutionId = inst.replace(/\s+/g, '_').toLowerCase();
        try {
          await setDoc(
            doc(firestore, 'institutions', institutionId),
            {
              name: inst,
              city: city || '',
              updatedAt: new Date(),
              doctors: arrayUnion(selectedUser.id), 
            },
            { merge: true }
          );
          console.log('[PromoteUserModal] Institution added/updated:', institutionId);
        } catch (e) {
          console.error('[PromoteUserModal] Error adding institution:', institutionId, e);
        }
      }

      // 3. Promote user to doctor
      console.log('[PromoteUserModal] Calling promoteUserToDoctor...');
      await promoteUserToDoctor(selectedUser.id, doctorPayload);
      console.log('[PromoteUserModal] promoteUserToDoctor success');
      Alert.alert("Success", "User has been promoted to doctor!");
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err) {
      console.error('[PromoteUserModal] Error promoting doctor:', err);
      Alert.alert("Error", "Could not promote user to doctor.");
    }
  };

  useEffect(() => {
    if (visible) {
      if (preselectedUser) {
        setSelectedUser(preselectedUser);
      } else {
        setSelectedUser(null);
        handleSearch();
      }
    }
  }, [visible, preselectedUser]);

  useEffect(() => {
    if (preselectedUser && visible) {
      setSelectedUser(preselectedUser);
      setFirstName(preselectedUser.firstName || '');
      setLastName(preselectedUser.lastName || '');
      setCUIM(preselectedUser.cuim || '');
      setSpecializationType(preselectedUser.specializationType || 'rezident');
      setStudies(preselectedUser.studies || '');
      setInstitutions(preselectedUser.institutions || []);
      setBiography(preselectedUser.biography || '');
      setCity(preselectedUser.city || '');
      setExperienceYears(preselectedUser.experienceYears ? String(preselectedUser.experienceYears) : '');
      setHasCAS(preselectedUser.hasCAS || false);
    }
  }, [preselectedUser, visible]);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch clinics and location (similar to become-doctor)
  useEffect(() => {
    if (!showMap) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

          let clinicsData: any[] = [];
          if (city && city.trim().length > 0) {
            // Search clinics by city (text search) - dermatologie + clinic
            const urlDerm = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dermatologie+${encodeURIComponent(city)}&key=${GOOGLE_MAPS_API_KEY}`;
            const urlClinic = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=clinic+${encodeURIComponent(city)}&key=${GOOGLE_MAPS_API_KEY}`;
            const [respDerm, respClinic] = await Promise.all([
              fetch(urlDerm),
              fetch(urlClinic)
            ]);
            const dataDerm = await respDerm.json();
            const dataClinic = await respClinic.json();
            const allResults = [...(dataDerm.results || []), ...(dataClinic.results || [])];
            clinicsData = allResults.filter(
              (item, index, self) =>
                index === self.findIndex((i) => i.place_id === item.place_id)
            );
          } else {
            // Search clinics by coordinates (nearby search) - dermatologie + clinic
            const latitude = loc.coords.latitude;
            const longitude = loc.coords.longitude;
            const radius = 5000;
            const urlDerm = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&keyword=dermatologie&key=${GOOGLE_MAPS_API_KEY}`;
            const urlClinic = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&keyword=clinic&key=${GOOGLE_MAPS_API_KEY}`;
            const [respDerm, respClinic] = await Promise.all([
              fetch(urlDerm),
              fetch(urlClinic)
            ]);
            const dataDerm = await respDerm.json();
            const dataClinic = await respClinic.json();
            const allResults = [...(dataDerm.results || []), ...(dataClinic.results || [])];
            clinicsData = allResults.filter(
              (item, index, self) =>
                index === self.findIndex((i) => i.place_id === item.place_id)
            );
          }

          const formattedClinics = clinicsData.map((c: any) => ({
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
        } else {
          setClinics([]);
        }
      } catch (e) {
        setClinics([]);
      }
    }, 1); // 500ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [showMap, city]);

  const fetchClinics = async (cityValue: string) => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

        let clinicsData: any[] = [];
        if (cityValue && cityValue.trim().length > 0) {
          // Search clinics by city (text search) - dermatologie + clinic
          const urlDerm = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dermatologie+${encodeURIComponent(cityValue)}&key=${GOOGLE_MAPS_API_KEY}`;
          const urlClinic = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=clinic+${encodeURIComponent(cityValue)}&key=${GOOGLE_MAPS_API_KEY}`;
          const [respDerm, respClinic] = await Promise.all([
            fetch(urlDerm),
            fetch(urlClinic)
          ]);
          const dataDerm = await respDerm.json();
          const dataClinic = await respClinic.json();
          const allResults = [...(dataDerm.results || []), ...(dataClinic.results || [])];
          clinicsData = allResults.filter(
            (item, index, self) =>
              index === self.findIndex((i) => i.place_id === item.place_id)
          );
        } else {
          // Search clinics by coordinates (nearby search) - dermatologie + clinic
          const latitude = loc.coords.latitude;
          const longitude = loc.coords.longitude;
          const radius = 5000;
          const urlDerm = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&keyword=dermatologie&key=${GOOGLE_MAPS_API_KEY}`;
          const urlClinic = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&keyword=clinic&key=${GOOGLE_MAPS_API_KEY}`;
          const [respDerm, respClinic] = await Promise.all([
            fetch(urlDerm),
            fetch(urlClinic)
          ]);
          const dataDerm = await respDerm.json();
          const dataClinic = await respClinic.json();
          const allResults = [...(dataDerm.results || []), ...(dataClinic.results || [])];
          clinicsData = allResults.filter(
            (item, index, self) =>
              index === self.findIndex((i) => i.place_id === item.place_id)
          );
        }

        const formattedClinics = clinicsData.map((c: any) => ({
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
      } else {
        setClinics([]);
      }
    } catch (e) {
      setClinics([]);
    }
    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          resetForm(); // ← adaugă această linie pentru resetare completă
          onClose();
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {roleType === 'moderator'
                  ? 'Promote user to moderator'
                  : 'Promote user to doctor'}
              </Text>

              {/* Search and user list */}
              {!selectedUser && (
                <>
                  <TextInput
                    placeholder="Search by username"
                    placeholderTextColor={theme.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                    style={[
                      styles.searchInput,
                      {
                        backgroundColor: theme.textInputBackground,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                  />

                  {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} />
                  ) : (
                    <FlatList
                      data={users}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={[styles.userItem, { borderBottomColor: theme.border }]}>
                          <Text style={[styles.username, { color: theme.textPrimary }]}>
                            {item.username}
                          </Text>
                          <Text style={[styles.email, { color: theme.textSecondary }]}>
                            {item.email}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              roleType === 'moderator'
                                ? handlePromoteModerator(item.id)
                                : setSelectedUser(item)
                            }
                            style={[styles.promoteButton, { backgroundColor: theme.primary }]}
                          >
                            <Text style={styles.promoteButtonText}>
                              {roleType === 'moderator'
                                ? 'Promote'
                                : 'Select'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  )}

                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, { backgroundColor: theme.border }]}
                  >
                    <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Additional form for doctor */}
              {roleType === 'doctor' && selectedUser && (
                <>
                  {/* Clinics map */}
                  <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)} transparent={false}>
                    {location && (
                      <ClinicMapScreen
                        clinics={clinics}
                        initialRegion={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                          latitudeDelta: 0.05,
                          longitudeDelta: 0.05,
                        }}
                        onClose={() => {
                          setShowMap(false);
                          setTimeout(() => {
                            // Reopen form after map closes
                          }, 100);
                        }}
                        onSelectClinic={(clinic) => {
                          if (!institutions.includes(clinic.name)) {
                            setInstitutions([...institutions, clinic.name]);
                          }
                          setShowMap(false);
                        }}
                      />
                    )}
                  </Modal>
                  <ScrollView
                    style={{ maxHeight: 400 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={{ color: theme.textPrimary, marginBottom: 8 }}>
                      Fill in the additional information for doctor:
                    </Text>
                    {selectedUser?.email && (
                      <Text style={{ color: theme.textSecondary, marginBottom: 12, textAlign: 'center' }}>
                        Email: <Text style={{ color: theme.textPrimary }}>{selectedUser.email}</Text>
                      </Text>
                    )}
                    <TextInput
                      placeholder="First name *"
                      placeholderTextColor={theme.textSecondary}
                      value={firstName}
                      onChangeText={setFirstName}
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                    <TextInput
                      placeholder="Last name *"
                      placeholderTextColor={theme.textSecondary}
                      value={lastName}
                      onChangeText={setLastName}
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                    <TextInput
                      placeholder="CUIM number *"
                      placeholderTextColor={theme.textSecondary}
                      value={cuim}
                      onChangeText={setCUIM}
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                    />

                    <TextInput
                      placeholder="City (optional)"
                      placeholderTextColor={theme.textSecondary}
                      value={city}
                      onChangeText={setCity}
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                    <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
                      Clinics/Institutions (at least one) *
                    </Text>
                    <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: 10 }}>
                      
                      <TouchableOpacity
                        style={{
                          backgroundColor: theme.primary,
                          padding: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                          marginTop: 8,
                          width: '100%',
                          maxWidth: 400,
                          alignSelf: 'center',
                        }}
                        onPress={async () => {
                          await fetchClinics(city);
                          setShowMap(true);
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Add clinic</Text>
                      </TouchableOpacity>
                    </View>
                    {institutions.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                        {institutions.map((inst, idx) => (
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
                              {inst}
                            </Text>
                            <TouchableOpacity
                              onPress={() => setInstitutions(institutions.filter((_, i) => i !== idx))}
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
                    <View style={{ marginBottom: 15 }}>
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
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                    <TextInput
                      placeholder="Biography (max 500 characters) (optional)"
                      placeholderTextColor={theme.textSecondary}
                      value={biography}
                      onChangeText={setBiography}
                      multiline
                      maxLength={500}
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                          height: 80,
                        },
                      ]}
                    />
                    
                    <TextInput
                      placeholder="Years of experience (optional)"
                      placeholderTextColor={theme.textSecondary}
                      value={experienceYears}
                      onChangeText={setExperienceYears}
                      keyboardType="numeric"
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.textInputBackground,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                        },
                      ]}
                    />

                    <TouchableOpacity
                      style={[
                        styles.promoteButton,
                        {
                          backgroundColor: hasCAS ? theme.primary : theme.textInputBackground,
                          borderColor: theme.border,
                          marginBottom: 10,
                        },
                      ]}
                      onPress={() => setHasCAS(!hasCAS)}
                    >
                      <Text style={{
                        color: hasCAS ? 'white' : theme.textPrimary,
                        fontWeight: 'bold',
                      }}>
                        Has CAS contract
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handlePromoteDoctor}
                      style={[styles.promoteButton, { backgroundColor: theme.primary }]}
                    >
                      <Text style={styles.promoteButtonText}>Grant doctor role</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSelectedUser(null)}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>Back</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
              {/* ...existing code... */}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  promoteButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  promoteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
});
