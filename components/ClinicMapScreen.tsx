import React from 'react';
import { View, Text, Button, Modal, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
};

interface ClinicMapScreenProps {
  clinics: Clinic[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onClose: () => void;
}

export default function ClinicMapScreen({ clinics, initialRegion, onClose }: ClinicMapScreenProps) {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
            title={clinic.name}
          >
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 2 }}>
              <MaterialCommunityIcons name="hospital-marker" size={28} color="red" />
            </View>
          </Marker>
        ))}
      </MapView>
      <Button title="Închide harta" onPress={onClose} />
    </View>
  );
}
