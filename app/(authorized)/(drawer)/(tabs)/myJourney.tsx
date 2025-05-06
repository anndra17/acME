import Ionicons from "@expo/vector-icons/Ionicons";
import { Slot } from "expo-router";
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, useColorScheme, Dimensions, ImageBackground  } from "react-native";
import { Colors} from "../../../../constants/Colors";
import { useEffect, useState } from "react";
import { Post } from "../../../../types/Post";
import { getCurrentUser } from "../../../../lib/firebase-service";
import Button from "../../../../components/Button";

const { width, height } = Dimensions.get('window');


// const dummyPosts = [
//     { id: '1', image: require('@/assets/post1.jpg'), reviewed: true },
//     { id: '2', image: require('@/assets/post2.jpg'), reviewed: false },
//     { id: '3', image: require('@/assets/post3.jpg'), reviewed: true },
//     // Adaugă mai multe postări...
//   ];

const MyJourneyScreen = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [filter, setFilter] = useState<'all' | 'reviewed'>('all');

    // const filteredPosts =
    // filter === 'all'
    //   ? dummyPosts
    //   : dummyPosts.filter((post) => post.reviewed);

    return (
        <View style={styles.container}>

        <ImageBackground
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }} // imaginea de fundal a userului
            style={styles.backgroundImage}
            resizeMode="cover"
        >
        {/* Header */}
        <View style={[styles.header, {backgroundColor: theme.primary}]}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>10</Text>
              <Text style={styles.statLabel}>My Community</Text>
            </View>

            <View style={styles.profilePicContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
              style={styles.profilePic}
            />
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5/8</Text>
            <Text style={styles.statLabel}>Reviewed Posts</Text>
          </View>
         </View>

         <Text style={styles.username}>@anndra17</Text>

         <View style={styles.buttonRow}>
          <Button label="All" type={'secondary'} labelStyle={filter === 'all' ? {textDecorationLine: 'underline', color: theme.background} : {}}    style={{  width: width * 0.1, height: 40 }} onPress={() => setFilter('all')} />
          <Button label="Reviewed" type={'secondary'} labelStyle={filter === 'reviewed' ? {textDecorationLine: 'underline', color: theme.background} : {}}   style={{  width: width * 0.2, height: 40  }} onPress={() => setFilter('reviewed')} />
        </View>
        </View>
        </ImageBackground>

 
        {/* <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <Image source={item.image} style={styles.postImage} resizeMode="cover" />
        )}
        /> */}
        </View>

    );
};

export default MyJourneyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    width: '100%',
  },
  header: {
    backgroundColor: '#941b2d',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: height / 7
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
    marginHorizontal: 10,
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
  postImage: {
    width: (width - 60) / 2,
    height: 160,
    borderRadius: 12,
  },
});