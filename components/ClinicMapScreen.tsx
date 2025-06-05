import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, FlatList } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env';

type Clinic = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  doctors: string[];
};

export default function ClinicMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setPermissionGranted(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchClinics(loc.coords.latitude, loc.coords.longitude);
    } else {
      setPermissionGranted(false);
    }
  };

  const fetchClinics = async (lat: number, lng: number) => {
    try {
      const radius = 100; // 5 km
      const type = 'hospital'; // sau 'clinic' dacă e suportat

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        const formattedClinics = data.results.slice(0, 3).map((c: any) => ({
          id: c.place_id,
          name: c.name,
          latitude: c.geometry.location.lat,
          longitude: c.geometry.location.lng,
          rating: c.rating || 0,
          doctors: ['Doctor 1', 'Doctor 2'], // pentru demo, mai poți face un alt API call pt medici
        }));

        setClinics(formattedClinics);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  if (!permissionGranted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You need to activate location to see nearby clinics.</Text>
        <Button title="Enable Location" onPress={requestLocationPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {clinics.map((clinic) => (
            <Marker
              key={clinic.id}
              coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
              title={clinic.name}
              onPress={() => setSelectedClinic(clinic)}
            />
          ))}
        </MapView>
      )}

      <Modal visible={!!selectedClinic} transparent animationType="slide">
        <View style={{ backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{selectedClinic?.name}</Text>
          <Text>Rating: {selectedClinic?.rating} ⭐</Text>
          <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Doctors:</Text>
          <FlatList
            data={selectedClinic?.doctors || []}
            renderItem={({ item }) => <Text>- {item}</Text>}
            keyExtractor={(item, index) => index.toString()}
          />
          <Button title="Close" onPress={() => setSelectedClinic(null)} />
        </View>
      </Modal>
    </View>
  );
}
