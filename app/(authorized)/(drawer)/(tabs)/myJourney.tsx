import * as ImagePicker from 'expo-image-picker';
import { Slot, useFocusEffect } from "expo-router";
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, useColorScheme, Dimensions, ImageBackground, ActivityIndicator, SafeAreaView } from "react-native";
import { Colors } from "../../../../constants/Colors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Post } from "../../../../types/Post";
import { getUserImageCount, getUserPosts, getUserProfile, uploadUserImage, getFriendsCount } from "../../../../lib/firebase-service";
import Button from "../../../../components/Button";
import { getAuth } from "@firebase/auth";
import { FontAwesome } from '@expo/vector-icons';
import PostDetailsModal from '../../../../components/PostDetailModal';
import PostGrid from "../../../../components/PostGrid";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import { useRouter } from "expo-router";

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
    const [friendsCount, setFriendsCount] = useState<number>(0);

    const [showFriendsModal, setShowFriendsModal] = useState(false);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);

    const openModal = (index: number) => {
      setSelectedPostIndex(index);
      setIsModalVisible(true);
    };
    
    const router = useRouter();

    const handleOpenFriendsPage = () => {
      router.push("/(authorized)/(drawer)/friendsList");
    };

    const numColumns = 3;
    const spacing = 10;

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

                const friends = await getFriendsCount(userId);
                setFriendsCount(friends);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, backgroundColor: theme.primary }}>
        {/* Coperta */}
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
          {/* Iconiță ✏️ copertă */}
          <TouchableOpacity
            onPress={handleCoverUpdate}
            style={styles.coverEditIcon}
          >
            <FontAwesome name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </ImageBackground>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          {/* Imagine de profil suprapusă */}
          <View style={styles.profilePicWrapper}>
            <TouchableOpacity onPress={handleProfileUpdate}>
              <Image
                source={{
                  uri: userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "Anonim")}`
                }}
                style={styles.profilePic}
                onLoadEnd={() => setProfileImageLoading(false)}
              />
            </TouchableOpacity>
            {/* Mută iconița aici, în afara imaginii */}
            <TouchableOpacity
              onPress={handleProfileUpdate}
              style={styles.profileEditIcon}
              activeOpacity={0.7}
            >
              <FontAwesome name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>
          {/* Username */}
          <Text style={styles.username}>@{username}</Text>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <TouchableOpacity onPress={handleOpenFriendsPage} style={{ alignItems: "center" }}>
                <Text style={styles.statNumber}>{friendsCount}</Text>
                <Text style={styles.statLabel}>My Community</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{reviewedCount}/{posts.length}</Text>
              <Text style={styles.statLabel}>Reviewed Posts</Text>
            </View>
          </View>
          {/* Filtre */}
          <View style={styles.buttonRow}>
            <Button label="All" type={'secondary'} labelStyle={filter === 'all' ? { textDecorationLine: 'underline', color: theme.background } : {}} style={{ width: width * 0.1, height: 40 }} onPress={() => setFilter('all')} />
            <Button label="Reviewed" type={'secondary'} labelStyle={filter === 'reviewed' ? { textDecorationLine: 'underline', color: theme.background } : {}} style={{ width: width * 0.2, height: 40 }} onPress={() => setFilter('reviewed')} />
          </View>
        </View>

        {/* Postări */}
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
        </SafeAreaView>
    );
};

export default MyJourneyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.28,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  coverLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  header: {
    marginTop: height * 0.18,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  profilePicWrapper: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    zIndex: 3,
    backgroundColor: '#fff',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible', // <- schimbă din 'hidden' în 'visible'
    elevation: 4,
  },
  profilePic: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  profileEditIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(42, 39, 39, 0.39)',
    borderRadius: 100,
    padding: 4,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 42,
    marginTop: -80,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
  },
  postsContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    paddingTop: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  coverEditIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 8,
    zIndex: 20,
  },
});