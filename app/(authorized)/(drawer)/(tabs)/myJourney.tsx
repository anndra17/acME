import Ionicons from "@expo/vector-icons/Ionicons";
import { Slot, useFocusEffect } from "expo-router";
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, useColorScheme, Dimensions, ImageBackground, ActivityIndicator  } from "react-native";
import { Colors} from "../../../../constants/Colors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Post } from "../../../../types/Post";

import {  getUserImageCount, getUserPosts, getUserProfile } from "../../../../lib/firebase-service";
import Button from "../../../../components/Button";
import { getAuth } from "@firebase/auth";
import FadeInImage from "../../../../components/FadeInImage";

const { width, height } = Dimensions.get('window');
const defaultImageUrl = 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdefault_profile.png?alt=media&token=9c6839ea-13a6-47de-b8c5-b0d4d6f9ec6a';


const MyJourneyScreen = () => {
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

        {/* Header */}
        <View style={[styles.header, {backgroundColor: theme.primary}]}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>10</Text>
              <Text style={styles.statLabel}>My Community</Text>
            </View>

            <View style={styles.profilePicContainer}>
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
  ) }
</View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5/{!loading ? imageCount : ""}</Text>
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
        {loading && (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
            )}
        {!loading && (
        <FlatList
            data={posts}
            numColumns={numColumns}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing }}
            contentContainerStyle={{ paddingVertical: spacing,  }}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
                const isFirstRow = index < numColumns;
                const isFirstItem = index % numColumns === 0;
                const isLastItem = (index + 1) % numColumns === 0;
            
                const customBorderRadius = {
                borderTopLeftRadius: isFirstRow && isFirstItem ? 60 : 0,
                borderTopRightRadius: isFirstRow && isLastItem ? 60 : 0,
                };
            
                return (
                <View style={{ marginBottom: spacing }}>
                    <FadeInImage uri={item.imageUrl} customStyle={customBorderRadius} />
                </View>
                );
            }}
            
        />)}
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
  
});