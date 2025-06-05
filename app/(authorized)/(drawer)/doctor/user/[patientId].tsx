import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Button, ScrollView, Modal, TextInput
} from "react-native";
import { getUserProfile, getUserPosts, updatePostReview  } from "../../../../../lib/firebase-service";
import { Colors } from "../../../../../constants/Colors";
import { useColorScheme } from "react-native";

const PatientJourneyScreen = () => {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewedOnly, setShowReviewedOnly] = useState(false);
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile(patientId!);
        const userPosts = await getUserPosts(patientId!);
        setUser(userData);
        setPosts(userPosts);
        setFilteredPosts(userPosts);
      } catch (e) {
        console.error("Eroare la fetch:", e);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);

  useEffect(() => {
    if (showReviewedOnly) {
      setFilteredPosts(posts.filter((post) => !post.reviewed));
    } else {
      setFilteredPosts(posts);
    }
  }, [showReviewedOnly, posts]);

  const reviewedCount = posts.filter((p) => p.reviewed).length;

  const renderItem = ({ item }: { item: any }) => {
    console.log("Image URL:", item.imageUrl); // 👈 vezi url-ul în consolă
    return (
      <TouchableOpacity
        style={styles.postButton}
         onPress={() => {
            setSelectedPost(item);
            setFeedbackText(item.feedback || "");
        }}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Text style={styles.postText}>
          {item.reviewed ? "✅ Revizuit" : "🕒 De revizuit"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Image source={{ uri: user?.profileImage }} style={styles.profileImage} />
            <Text style={styles.title}>{user?.name || user?.username || user?.email}</Text>
            <Text style={styles.subTitle}>Postări: {reviewedCount}/{posts.length} revizuite</Text>
            <View style={styles.details}>
              <Text>🧴 Tratament: {user?.treatment || "Nespecificat"}</Text>
              <Text>📅 Ultima vizită: {user?.lastVisit || "N/A"}</Text>
              <Text>📆 Programare viitoare: {user?.nextAppointment || "N/A"}</Text>
            </View>
            <View style={styles.buttonsRow}>
              <Button title="Toate postările" onPress={() => setShowReviewedOnly(false)} />
              <Button title="De revizuit" onPress={() => setShowReviewedOnly(true)} />
            </View>
          </View>
        }
        data={filteredPosts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
        backgroundColor: theme.background,
        padding: 8,
        paddingBottom: 80, // pentru extra spațiu la final
        }}
      />

      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedPost?.imageUrl }} style={styles.modalImage} />
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              Descriere: {selectedPost?.description}
            </Text>

            <TextInput
              multiline
              placeholder="Adaugă feedback..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              style={styles.input}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title="Salvează feedback"
                onPress={async () => {
                  try {
                    await updatePostReview(patientId!, selectedPost.id, {
                      reviewed: true,
                      feedback: feedbackText,
                      feedbackTimestamp: new Date().toISOString(), // <-- adaugă data și ora
                    });

                    // update local (pentru feedback instantaneu)
                    setSelectedPost({ ...selectedPost, feedback: feedbackText, reviewed: true, feedbackTimestamp: new Date().toISOString() });
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === selectedPost.id
                          ? { ...p, feedback: feedbackText, reviewed: true, feedbackTimestamp: new Date().toISOString() }
                          : p
                      )
                    );
                    setSelectedPost(null);
                  } catch (e) {
                    console.error("Eroare la salvarea feedbackului:", e);
                  }
                }}
              />
              <Button title="Închide" onPress={() => setSelectedPost(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 8 },
  subTitle: { fontSize: 16, marginVertical: 4 },
  profileImage: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "#ccc",
  },
  details: {
    marginTop: 10, alignItems: "flex-start", width: "100%", paddingHorizontal: 32
  },
  buttonsRow: {
    flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "space-evenly"
  },
  postButton: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  image: { width: 140, height: 140, borderRadius: 8 },
  postText: { marginTop: 6, fontSize: 14, fontWeight: "500" },
modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
},
modalContent: {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 12,
  width: "85%",
  alignItems: "center",
},
modalImage: {
  width: 200,
  height: 200,
  borderRadius: 8,
  marginBottom: 12,
},
input: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 8,
  width: "100%",
  minHeight: 80,
  textAlignVertical: "top",
  marginBottom: 10,
},

});

export default PatientJourneyScreen;
