import * as ImagePicker from 'expo-image-picker';
import { Slot, useFocusEffect } from "expo-router";
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, useColorScheme, Dimensions, ImageBackground, ActivityIndicator  } from "react-native";
import { Colors} from "../../../../constants/Colors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Post } from "../../../../types/Post";

import {  getUserImageCount, getUserPosts, getUserProfile, uploadUserImage } from "../../../../lib/firebase-service";
import Button from "../../../../components/Button";
import { getAuth } from "@firebase/auth";
import FadeInImage from "../../../../components/FadeInImage";
import { FontAwesome } from '@expo/vector-icons';
import PostDetailsModal from '../../../../components/PostDetailModal';
import ProfileHeader from "../../../../components/ProfileHeader";
import PostGrid from "../../../../components/PostGrid";
import LoadingIndicator from "../../../../components/LoadingIndicator";

const { width, height } = Dimensions.get('window');


const MyJourneyScreen = () => {
    console.log("Sunt in pagina: (tabs)/myJourney.tsx"); 

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [filter, setFilter] = useState<'all' | 'reviewed'>('all');

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [imageCount, setImageCount] = useState<number>(0);
    const [userProfileImage, setUserProfileImage] = useState("");
    const [userCoverImage, setUserCoverImage] = useState("");
    const [coverImageLoading, setCoverImageLoading] = useState(true);
    const [profileImageLoading, setProfileImageLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);

    const openModal = (index: number) => {
      setSelectedPostIndex(index);
      setIsModalVisible(true);
    };
    

    const numColumns = 3;
    const spacing = 10;

    // Folosim useMemo pentru a calcula dimensiunea imaginii doar când width se schimbă
    const imageSize = useMemo(() => {
        return (width - spacing * (numColumns + 1)) / numColumns;
    }, [width]);

    useEffect(() => {
        const fetchData = async () => {
            const userId = getAuth().currentUser?.uid;
            if (!userId) return;

            try {
                const fetchedPosts = await getUserPosts(userId);
                setPosts(fetchedPosts);

                const fetchedImageCount = await getUserImageCount(userId);
                setImageCount(fetchedImageCount);

                const userData = await getUserProfile(userId);
                setUsername(userData.username);
                setUserProfileImage(userData.profileImage);
                setUserCoverImage(userData.coverImage);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useFocusEffect(
    useCallback(() => {
        const fetchPosts = async () => {
        const userId = getAuth().currentUser?.uid;
        if (!userId) return;
        try {
            const fetchedPosts = await getUserPosts(userId);
            setPosts(fetchedPosts);

            const fetchedImageCount = await getUserImageCount(userId);
            setImageCount(fetchedImageCount);
        } catch (error) {
            console.log(error);
        }
        };

        fetchPosts();
    }, [])
    );

    // Modifică funcțiile de actualizare pentru a reîmprospăta și listele de postări

const handleProfileUpdate = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    const currentUserId = getAuth().currentUser?.uid;
    if (currentUserId) {
      // Încarcă imaginea pe Firebase
      await uploadUserImage(uri, currentUserId, 'profileImage');
      
      // După ce imaginea este încărcată, recuperează datele actualizate ale utilizatorului
      const userData = await getUserProfile(currentUserId);
      setUserProfileImage(userData.profileImage);  // Actualizează imaginea de profil
      
      // Reîmprospătează lista de postări și numărul de imagini
      const fetchedPosts = await getUserPosts(currentUserId);
      setPosts(fetchedPosts);
      
      const fetchedImageCount = await getUserImageCount(currentUserId);
      setImageCount(fetchedImageCount);
    } else {
      console.error("User ID is undefined");
    }
  }
};

const handleCoverUpdate = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    const currentUserId = getAuth().currentUser?.uid;
    if (currentUserId) {
      // Încarcă imaginea de copertă pe Firebase
      await uploadUserImage(uri, currentUserId, 'coverImage');
      
      // După ce imaginea este încărcată, recuperează datele actualizate ale utilizatorului
      const userData = await getUserProfile(currentUserId);
      setUserCoverImage(userData.coverImage);  // Actualizează imaginea de copertă
      
      // Reîmprospătează lista de postări și numărul de imagini
      const fetchedPosts = await getUserPosts(currentUserId);
      setPosts(fetchedPosts);
      
      const fetchedImageCount = await getUserImageCount(currentUserId);
      setImageCount(fetchedImageCount);
    } else {
      console.error("User ID is undefined");
    }
  }
};
    
    

    const handleDeletePost = (deletedPostId: string) => {
      setPosts((prev) => {
        const newPosts = prev.filter((p) => p.id !== deletedPostId);
        setImageCount(newPosts.length);
        return newPosts;
      });
    };

    const reviewedCount = posts.filter((p) => p.reviewed).length;

    // Filtrare postări în funcție de selecția utilizatorului
    const filteredPosts = filter === 'reviewed'
      ? posts.filter((p) => p.reviewed)
      : posts;

    return (
        <View style={[styles.container, {backgroundColor: theme.primary}]}>

        <ImageBackground
          source={userCoverImage ? { uri: userCoverImage } : undefined}
          style={styles.backgroundImage}
          resizeMode='cover'
          onLoadStart={() => setCoverImageLoading(true)}
          onLoadEnd={() => setCoverImageLoading(false)}
        >
          {coverImageLoading && (
            <View style={styles.coverLoader}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}

          {/* Iconiță ✏️ în colțul din dreapta sus */}
          <TouchableOpacity
            onPress={handleCoverUpdate}
            style={styles.coverEditIcon}
          >
            <FontAwesome name="pencil" size={20} color="white" />
          </TouchableOpacity>

        {/* Header */}
        <View style={[styles.header, {backgroundColor: theme.primary}]}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>10</Text>
              <Text style={styles.statLabel}>My Community</Text>
            </View>

            <View style={styles.profilePicContainer}>
  <TouchableOpacity
    onPress={handleProfileUpdate} // Apelarea funcției pentru a schimba imaginea de profil
  >
    {profileImageLoading && (
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}>
        <ActivityIndicator size="small" color="#999999" />
      </View>
    )}
    {userProfileImage && (
      <Image
        source={{ uri: userProfileImage }}
        style={styles.profilePic}
        onLoadEnd={() => setProfileImageLoading(false)}
      />
    )}
    {/* Iconița de creion */}
    <View style={styles.profileEditIcon}>
    <FontAwesome name="pencil" size={10} color="white" />
    </View>
  </TouchableOpacity>
</View>



          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{reviewedCount}/{posts.length}</Text>
            <Text style={styles.statLabel}>Reviewed Posts</Text>
          </View>
         </View>

         <Text style={styles.username}>@{username}</Text>

         <View style={styles.buttonRow}>
          <Button label="All" type={'secondary'} labelStyle={filter === 'all' ? {textDecorationLine: 'underline', color: theme.background} : {}}    style={{  width: width * 0.1, height: 40 }} onPress={() => setFilter('all')} />
          <Button label="Reviewed" type={'secondary'} labelStyle={filter === 'reviewed' ? {textDecorationLine: 'underline', color: theme.background} : {}}   style={{  width: width * 0.2, height: 40  }} onPress={() => setFilter('reviewed')} />
        </View>
        </View>
        </ImageBackground>

        <View style={styles.postsContainer}>
        {loading ? (
    <LoadingIndicator />
  ) : (
    <PostGrid
      posts={filteredPosts}
      numColumns={numColumns}
      spacing={spacing}
      openModal={openModal}
    />
  )}
  <PostDetailsModal
    visible={isModalVisible}
    onClose={() => setIsModalVisible(false)}
    posts={filteredPosts} 
    initialIndex={selectedPostIndex}
    onDelete={handleDeletePost}
  />


        </View>

      
        </View>

    );
};

export default MyJourneyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
   
  },
  coverLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  header: {
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: height / 5.5
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
  },
  profilePicContainer: {
    width: 90,
    height: 90,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
    marginHorizontal: 10,
    marginTop: -50
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // sau folosește theme.background dacă vrei să fie tematic
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },  
  postsContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8', // sau theme.card etc.
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 2.5,
    overflow: 'hidden',
  },
  coverEditIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 100,
    padding: 6,
    zIndex: 20,
  },

  profileEditIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 100,
    padding: 4,
    zIndex: 20,

  },
  
});