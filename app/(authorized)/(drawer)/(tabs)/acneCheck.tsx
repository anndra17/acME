import { View, StyleSheet, Alert, ActivityIndicator, Modal, Dimensions, Text } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
// Firestore utils
import { getAuth } from 'firebase/auth';
import {  uploadPostAndSaveToFirestore } from '../../../../lib/firebase-service';
// Components 
import ImageViewer from '../../../../components/ImageViewer'; 
import Button from '../../../../components/Button';
import PostModal from '../../../../components/PostModal';
import { SkinCondition } from '../../../../types/Post';

import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors'; // ajustează calea dacă este diferită



const PlaceholderImage = require('../../../../assets/images/icon.png');


const AcneCheck = () => {
  const [selectedImage, setSelectedImage] = useState("");
  const [imageToBeAnalysed, setImageToBeAnalysed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  
  const showImagePickerOptions = () => {
    Alert.alert("Select Photo 😊", "Choose from:", [
      {
        text: "Take Photo",
        onPress: pickFromCamera,
      },
      {
        text: "Choose from Gallery",
        onPress: pickFromGallery,
      },
      {
        text: "Cancel",
        style: "cancel",
      }
    ])
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4,5],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4,5],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const chooseImageToBeAnalysed = () => {
    if (!selectedImage) {
      Alert.alert("Hold up! 🚫", "No cheating! We need a lovely photo of you first 😄");
      return;
    }

    setImageToBeAnalysed(selectedImage);
  }

  const handlePostButton = () => {
    setIsPostModalVisible(true); 
  };


  const handlePostSubmit = async ( postData: {
    description?: string;
    stressLevel: number;
    skinConditions?: SkinCondition[];
    treatmentUsed?: string;

  }) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !selectedImage) return;

    try {
      setIsLoading(true);
      await uploadPostAndSaveToFirestore(selectedImage, userId, postData);
      Alert.alert("Succes", "The post has been added!");
      setIsPostModalVisible(false);
      setSelectedImage("");
      setImageToBeAnalysed("");

    } catch (e) {
      Alert.alert("Error", "Something went wrong...");
    } finally {
      setIsLoading(false);
    }
  }
  

    return (
        <View style={styles.container}>
          
          <View
  style={{
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  }}
>
  <MaterialIcons name="info" size={28} color={Colors.light.primary} />
  <Text style={{ color: Colors.light.primary, fontSize: 15, flex: 1 }}>
    Please take the photo in a well-lit area, making sure your face is clearly visible and the background is minimal.
  </Text>
</View>

          <View style={styles.imageContainer}>
            <ImageViewer imgSource={selectedImage ? {uri: selectedImage}: PlaceholderImage} />
          </View>

        {!imageToBeAnalysed && (
          <View style={styles.footerContainer}>
            <Button 
              label={selectedImage ? "Change Photo" : "Choose Photo"}  
              icon='picture-o' 
              type='primary' 
              onPress={showImagePickerOptions}
            />
            <Button 
              label="Use this photo"
              onPress={chooseImageToBeAnalysed} />
          </View>
          )}

        {imageToBeAnalysed && (
          <View style={styles.footerContainer}>
            <Button 
              label="Analyse"  
              icon='magic' 
              type='primary' 
              //onPress= functie: trimit cerere catre model
            />
            <View style={{ alignItems: 'center',height: '20%', width: '10%' }}>
              <Button 
                label="Post   "
                loading={isLoading}
                style={{ marginTop: 10}}
                onPress={handlePostButton}
              />
              
              <Button 
                label=""
                icon='arrow-circle-left'
                style={{ marginTop: 10}}
                onPress={() => setImageToBeAnalysed("")}
                type="secondary"
              />
            </View>



          </View>
          )}

          <PostModal 
            visible={isPostModalVisible}
            onClose={() => setIsPostModalVisible(false)}
            imageUri={selectedImage}
            onSubmit={handlePostSubmit}
          />

      </View>
      );
    }

const screenHeight = Dimensions.get('window').height;
const isSmallScreen = screenHeight < 700;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  topLeftButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },  
  imageContainer: {
    flex: 1,
    paddingTop:15
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    paddingBottom: isSmallScreen ? 90 : 60,
  },
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
});

export default AcneCheck;