import { View, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
// Firestore utils
import { getAuth } from 'firebase/auth';
import { uploadImageAndSaveToFirestore } from '../../../../lib/firebase-service';
// Components 
import ImageViewer from '../../../../components/ImageViewer'; 
import Button from '../../../../components/Button';




const PlaceholderImage = require('../../../../assets/images/icon.png');


const AcneCheck = () => {
  const [selectedImage, setSelectedImage] = useState("");
  const [imageToBeAnalysed, setImageToBeAnalysed] = useState("");
  
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
    setImageToBeAnalysed(selectedImage);
  }

  const handlePostButton = async () => {
    try {
      if(!imageToBeAnalysed) {
        Alert.alert("No image selected 😳", "Please select an image first.");
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      await uploadImageAndSaveToFirestore(imageToBeAnalysed, user.uid);

      Alert.alert("Succes 😃", "Image uploaded and saved. ")
      setSelectedImage("");
      setImageToBeAnalysed("");
    }
    catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Upload failed 😔", "There was a problem uploading the image.");
    }
  };

    return (
        <View style={styles.container}>
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
            <Button 
              label="Post "
              onPress={handlePostButton}
            />
          </View>
          )}
        </View>
      );
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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