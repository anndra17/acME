import React, { useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
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
  address?: string;
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
  onSelectClinic?: (clinic: Clinic) => void;
}

export default function ClinicMapScreen({ clinics, initialRegion, onClose, onSelectClinic }: ClinicMapScreenProps) {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

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

      {/* Modal pentru detalii clinică */}
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
            minWidth: 320,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
              {selectedClinic?.name}
            </Text>
            {/* Adresa */}
            {selectedClinic?.address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <FontAwesome5 name="map-marker-alt" size={14} color="#A6012B" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, color: '#555', flexShrink: 1 }}>{selectedClinic.address}</Text>
              </View>
            )}
            {/* Reviews */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4, marginTop: 8 }}>Recenzii Google:</Text>
            {selectedClinic?.reviews && selectedClinic.reviews.length > 0 ? (
              <FlatList
                data={selectedClinic.reviews}
                keyExtractor={(_, idx) => idx.toString()}
                style={{ maxHeight: 120, width: 260 }}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      {item.profile_photo_url && (
                        <Image source={{ uri: item.profile_photo_url }} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }} />
                      )}
                      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{item.author_name}</Text>
                      <Text style={{ marginLeft: 6, color: '#f1c40f', fontSize: 13 }}>★ {item.rating}</Text>
                    </View>
                    <Text style={{ fontSize: 13 }}>{item.text}</Text>
                    <Text style={{ color: '#888', fontSize: 11 }}>{item.relative_time_description}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Nu există recenzii.</Text>
            )}
            {/* Butoane */}
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#A6012B',
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  borderRadius: 20,
                  marginRight: 10,
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
                    paddingHorizontal: 18,
                    borderRadius: 20,
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
        </View>
      </Modal>
    </View>
  );
}
