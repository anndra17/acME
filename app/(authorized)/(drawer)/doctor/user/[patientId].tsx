import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Button, ScrollView
} from "react-native";
import { getUserProfile, getUserPosts } from "../../../../../lib/firebase-service";
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.postButton}
      onPress={() => router.push(`/doctor/user/${patientId}/post/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.postText}>
        {item.reviewed ? "✅ Revizuit" : "🕒 De revizuit"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
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

      <FlatList
        data={filteredPosts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 8 }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});

export default PatientJourneyScreen;
