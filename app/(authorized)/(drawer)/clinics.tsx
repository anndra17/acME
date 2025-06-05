import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Image, useColorScheme } from 'react-native';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { FontAwesome5 } from '@expo/vector-icons';
import ClinicMapScreen from '../../../components/ClinicMapScreen';
import Button from '../../../components/Button';
import { Colors } from '../../../constants/Colors';

type GoogleReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
};

type Clinic = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_ratings_total?: number;
  doctors: string[];
  reviews?: GoogleReview[];
  address?: string; // <-- nou
};

export default function ClinicsScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [chosenClinic, setChosenClinic] = useState<Clinic | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<GoogleReview[] | null>(null);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        // Fetch clinics
        const latitude = loc.coords.latitude;
        const longitude = loc.coords.longitude;
        const radius = 5000;
        const type = 'hospital';
        const keyword = 'dermatologie';
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
            doctors: ['Doctor 1', 'Doctor 2'],
            address: c.vicinity || c.formatted_address || '', // <-- nou
          }));
          setClinics(formattedClinics);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading clinics...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Location not available.</Text>
      </View>
    );
  }

  const top5Clinics = clinics.slice(0, 5);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {chosenClinic ? (
        <>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Clinica pe care ai selectat-o:
          </Text>
          <View
            style={{
              marginBottom: 16,
              backgroundColor: '#f8f8f8',
              borderRadius: 24,
              padding: 16,
              maxWidth: '100%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
              alignSelf: 'center',
              width: '98%',
              position: 'relative',
            }}
          >
            {/* Buton X în colț dreapta sus */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                // fără fundal, doar iconița X
                zIndex: 10,
              }}
              activeOpacity={0.7}
              onPress={() => setChosenClinic(null)}
            >
              <FontAwesome5 name="times" size={22} color={theme.primary} />
            </TouchableOpacity>

            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 6 }}>{chosenClinic.name}</Text>
            {/* Adresa */}
            {chosenClinic.address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 6 }}>
                <FontAwesome5 name="map-marker-alt" size={13} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, color: '#555' }}>{chosenClinic.address}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              {/* Rating */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={async () => {
                  const reviews = await fetchClinicReviews(chosenClinic.id);
                  setSelectedReviews(reviews);
                  setReviewsModalVisible(true);
                }}
              >
                <Text style={{ fontSize: 15, color: '#333' }}>
                  {chosenClinic.rating > 0 ? chosenClinic.rating.toFixed(1) : 'N/A'}
                </Text>
                <FontAwesome5 name="star" size={14} color="#f1c40f" style={{ marginLeft: 4, marginRight: 2 }} />
                {chosenClinic.user_ratings_total && (
                  <Text style={{ fontSize: 13, color: '#888', marginLeft: 2 }}>
                    ({chosenClinic.user_ratings_total})
                  </Text>
                )}
              </TouchableOpacity>
              {/* Buton vezi pe hartă */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.tabIconDefault,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 4,
                  elevation: 3,
                  marginLeft: 8,
                }}
                activeOpacity={0.85}
                onPress={() => setShowMap(true)}
              >
                <Text style={{ color: theme.buttonText, fontWeight: 'bold', marginRight: 6, fontSize: 13 }}>Vezi pe hartă</Text>
                <FontAwesome5 name="hospital" size={16} color={theme.buttonText} />
              </TouchableOpacity>
              {/* Buton vezi doctori */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.primary,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 4,
                  elevation: 3,
                  marginLeft: 8,
                }}
                activeOpacity={0.85}
                onPress={() => {
                  alert(`Doctori: ${chosenClinic.doctors.join(', ')}`);
                }}
              >
                <Text style={{ color: theme.buttonText, fontWeight: 'bold', marginRight: 6, fontSize: 13 }}>Vezi doctori</Text>
                <FontAwesome5 name="user-md" size={16} color={theme.buttonText} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Cele mai apropiate clinici:
          </Text>
          <FlatList
            data={top5Clinics}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => (
              <View
                style={{
                  marginBottom: 16,
                  backgroundColor: '#f8f8f8',
                  borderRadius: 24,
                  padding: 12,
                  maxWidth: '100%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 4,
                  alignSelf: 'center',
                  width: '98%',
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                {/* Adresa */}
                {item.address && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 6 }}>
                    <FontAwesome5 name="map-marker-alt" size={13} color={theme.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, color: '#555' }}>{item.address}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  {/* Rating */}
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={async () => {
                      const reviews = await fetchClinicReviews(item.id);
                      setSelectedReviews(reviews);
                      setReviewsModalVisible(true);
                    }}
                  >
                    <Text style={{ fontSize: 15, color: '#333' }}>
                      {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
                    </Text>
                    <FontAwesome5 name="star" size={14} color="#f1c40f" style={{ marginLeft: 4, marginRight: 2 }} />
                    {item.user_ratings_total && (
                      <Text style={{ fontSize: 13, color: '#888', marginLeft: 2 }}>
                        ({item.user_ratings_total})
                      </Text>
                    )}
                  </TouchableOpacity>
                  {/* Buton vezi pe hartă */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.tabIconDefault,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.18,
                      shadowRadius: 4,
                      elevation: 3,
                      marginLeft: 8,
                    }}
                    activeOpacity={0.85}
                    onPress={() => setShowMap(true)} // Doar deschide harta!
                  >
                    <Text style={{ color: theme.buttonText, fontWeight: 'bold', marginRight: 6, fontSize: 13 }}>Vezi pe hartă</Text>
                    <FontAwesome5 name="hospital" size={16} color={theme.buttonText} />
                  </TouchableOpacity>
                  {/* Buton vezi doctori */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.primary,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.18,
                      shadowRadius: 4,
                      elevation: 3,
                      marginLeft: 8,
                    }}
                    activeOpacity={0.85}
                    onPress={() => {
                      // Aici poți deschide un modal sau naviga către o pagină cu doctorii clinicii
                      alert(`Doctori: ${item.doctors.join(', ')}`);
                    }}
                  >
                    <Text style={{ color: theme.buttonText, fontWeight: 'bold', marginRight: 6, fontSize: 13 }}>Vezi doctori</Text>
                    <FontAwesome5 name="user-md" size={16} color={theme.buttonText} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: theme.icon,
          padding: 14,
          borderRadius: 24,
          alignItems: 'center',
          marginTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 4,
          elevation: 3,
          width: '90%',
          alignSelf: 'center',
        }}
        activeOpacity={0.85}
        onPress={() => {
          setShowMap(true);
          // Dacă vrei să poți reseta clinica selectată când alegi alta, poți adăuga aici: setChosenClinic(null);
        }}
      >
        <Text style={{ color: theme.buttonText, fontWeight: 'bold', fontSize: 16 }}>
          {chosenClinic ? 'Alege altă clinică' : 'Vezi toate pe hartă'}
        </Text>
      </TouchableOpacity>

      {/* Modal pentru toate clinicile */}
      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <ClinicMapScreen
          clinics={top5Clinics}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onClose={() => setShowMap(false)}
          onSelectClinic={(clinic) => setChosenClinic(clinic)}
        />
      </Modal>

      {/* Modal pentru recenzii */}
      <Modal visible={reviewsModalVisible} animationType="slide" onRequestClose={() => setReviewsModalVisible(false)}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Recenzii Google</Text>
          <FlatList
            data={selectedReviews || []}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16, backgroundColor: '#f8f8f8', borderRadius: 8, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  {item.profile_photo_url && (
                    <Image source={{ uri: item.profile_photo_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                  )}
                  <Text style={{ fontWeight: 'bold' }}>{item.author_name}</Text>
                  <Text style={{ marginLeft: 8, color: '#f1c40f' }}>★ {item.rating}</Text>
                </View>
                <Text style={{ color: '#333' }}>{item.text}</Text>
                <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{item.relative_time_description}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>Nu există recenzii.</Text>}
          />
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary, // visiniu
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 8,
            }}
            onPress={() => setReviewsModalVisible(false)}
          >
            <Text style={{ color: theme.buttonText, fontWeight: 'bold' }}>Închide</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

async function fetchClinicReviews(placeId: string): Promise<GoogleReview[]> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.result?.reviews || [];
}
