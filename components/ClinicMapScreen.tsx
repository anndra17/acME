import React, { useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '@env';

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
  photos?: { photo_reference: string }[];
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
  onSelectClinic?: (clinic: Clinic) => void; // <-- nou
}

export default function ClinicMapScreen({ clinics, initialRegion, onClose, onSelectClinic }: ClinicMapScreenProps) {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Funcție pentru a genera URL-ul imaginii
  const getPhotoUrl = (photoReference: string) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
            title={clinic.name}
            onPress={() => setSelectedClinic(clinic)}
          >
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 2 }}>
              <MaterialCommunityIcons name="hospital-marker" size={28} color="red" />
            </View>
          </Marker>
        ))}
      </MapView>
      <TouchableOpacity
        style={{
          backgroundColor: '#A6012B',
          padding: 12,
          borderRadius: 24,
          alignItems: 'center',
          margin: 16,
        }}
        onPress={onClose}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Închide harta</Text>
      </TouchableOpacity>

      {/* Modal pentru imagine clinică */}
      <Modal visible={!!selectedClinic} transparent animationType="slide" onRequestClose={() => setSelectedClinic(null)}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            maxWidth: '90%',
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{selectedClinic?.name}</Text>
            {selectedClinic?.photos && selectedClinic.photos.length > 0 ? (
              <Image
                source={{ uri: getPhotoUrl(selectedClinic.photos[0].photo_reference) }}
                style={{ width: 300, height: 180, borderRadius: 12, marginBottom: 12 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ marginBottom: 12 }}>Nu există imagine disponibilă.</Text>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: '#A6012B',
                paddingVertical: 8,
                paddingHorizontal: 24,
                borderRadius: 20,
                marginTop: 8,
                marginBottom: 8,
              }}
              onPress={() => setSelectedClinic(null)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Închide</Text>
            </TouchableOpacity>
            {onSelectClinic && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFC112',
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                  borderRadius: 20,
                  marginBottom: 8,
                }}
                onPress={() => {
                  onSelectClinic(selectedClinic!);
                  setSelectedClinic(null);
                  onClose();
                }}
              >
                <Text style={{ color: '#A6012B', fontWeight: 'bold' }}>Selectează clinica</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
