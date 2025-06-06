import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useColorScheme } from "react-native";
import { AppUser, searchUsers, sendFriendRequest, getFriendsIds, getFriendsPosts } from "../../../../lib/firebase-service"; // adaptează calea
import { useSession } from "@/../context";

type FriendPost = {
  id: string;
  user: {
    username: string;
    name: string;
    email: string;
    profileImage: string;
  };
  image: string;
  description: string;
  likes: number;
  comments: number;
  createdAt: string;
};

const MOCK_POSTS: FriendPost[] = [
  {
    id: "1",
    user: {
      username: "andrei23",
      name: "Andrei Pop",
      email: "andrei23@email.com",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    description: "O zi superbă cu prietenii! ☀️",
    likes: 12,
    comments: 3,
    createdAt: "acum 2 ore",
  },
  {
    id: "2",
    user: {
      username: "mariaa",
      name: "Maria Ionescu",
      email: "mariaa@email.com",
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    description: "Cafea și relaxare ☕️",
    likes: 20,
    comments: 5,
    createdAt: "acum 1 zi",
  },
];

const FILTERS = [
  { label: "Username", value: "username" },
  { label: "Nume", value: "name" },
  { label: "Email", value: "email" },
];

export default function FriendsFeedScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("username");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchResults, setSearchResults] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Modal pentru cerere de prietenie
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [friendRequestMessage, setFriendRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const { user } = useSession(); // user: User din Firebase Auth

  // Pentru demo, filtrăm doar local pe useri hardcodați
  const filteredPosts = MOCK_POSTS.filter((post) => {
    const val = search.toLowerCase();
    if (!val) return true;
    if (filter === "username") return post.user.username.toLowerCase().includes(val);
    if (filter === "name") return post.user.name.toLowerCase().includes(val);
    if (filter === "email") return post.user.email.toLowerCase().includes(val);
    return true;
  });

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    // Trimitem termenul de căutare cu litere mici
    const results = await searchUsers(text.toLowerCase(), filter as any);
    setSearchResults(
      results.filter(user =>
        (filter === "username" && user.username?.toLowerCase().includes(text.toLowerCase())) ||
        (filter === "name" && user.name?.toLowerCase().includes(text.toLowerCase())) ||
        (filter === "email" && user.email?.toLowerCase().includes(text.toLowerCase()))
      )
    );
    setLoading(false);
  };

  // Trimitere cerere de prietenie
  const handleSendFriendRequest = async () => {
    if (!user || !selectedUser) return;
    setSendingRequest(true);
    try {
      await sendFriendRequest(user.uid, selectedUser.id, friendRequestMessage);
      setSendingRequest(false);
      setRequestSent(true);
      setTimeout(() => {
        setSelectedUser(null);
        setRequestSent(false);
        setFriendRequestMessage("");
      }, 1500);
    } catch (e) {
      setSendingRequest(false);
      // poți afișa un toast/alert aici
    }
  };

  useEffect(() => {
    const fetchFriendsPosts = async () => {
      if (!user) return;
      setLoadingPosts(true);
      try {
        const friendIds = await getFriendsIds(user.uid);
        const friendsPosts = await getFriendsPosts(friendIds);
        setPosts(friendsPosts);
      } catch (e) {
        // poți afișa un toast/alert
      }
      setLoadingPosts(false);
    };
    fetchFriendsPosts();
  }, [user]);

  const renderPost = ({ item }: { item: FriendPost }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.textPrimary }]}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.user?.profileImage || "https://ui-avatars.com/api/?name=Anonim" }}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.username, { color: theme.textPrimary }]}>{item.user.username}</Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{item.createdAt}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      <Image
        source={{ uri: item.image }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <View style={styles.actionsRow}>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={26} color={theme.textPrimary} style={{ marginRight: 12 }} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="chatbubble-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.likes, { color: theme.textPrimary }]}>{item.likes} aprecieri</Text>
      <Text style={[styles.description, { color: theme.textPrimary }]}>
        <Text style={{ fontWeight: "bold" }}>{item.user.username} </Text>
        {item.description}
      </Text>
      <TouchableOpacity>
        <Text style={[styles.comments, { color: theme.textSecondary }]}>Vezi toate cele {item.comments} comentarii</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* SearchBar */}
      <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={{ position: "relative", flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginHorizontal: 8 }} />
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder={`Caută după ${FILTERS.find(f => f.value === filter)?.label.toLowerCase()}...`}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={handleSearch}
          />
          <View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal((v) => !v)}>
              <Ionicons name="filter" size={20} color={theme.primary} />
            </TouchableOpacity>
            {showFilterModal && (
              <View style={[styles.dropdownModal, { backgroundColor: theme.cardBackground, borderColor: theme.border, right: 0, top: 36 }]}>
                {FILTERS.map(f => (
                  <TouchableOpacity
                    key={f.value}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFilter(f.value);
                      setShowFilterModal(false);
                    }}
                  >
                    <Ionicons
                      name={filter === f.value ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={filter === f.value ? theme.primary : theme.textSecondary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: filter === f.value ? theme.primary : theme.textPrimary, fontSize: 16 }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Rezultate căutare */}
      {search.length > 1 && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedUser(item)}>
              <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                <Image source={{ uri: item.profileImage }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                <View>
                  <Text style={{ fontWeight: "bold" }}>{item.username}</Text>
                  {filter === "email" ? (
                    <Text style={{ color: "#888" }}>{item.email}</Text>
                  ) : (
                    <Text style={{ color: "#888" }}>{item.name || item.email}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal cerere de prietenie */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedUser(null)}>
          <View style={[styles.friendModal, { backgroundColor: theme.cardBackground }]}>
            <View style={{ alignItems: "center" }}>
              <Image
                source={{ uri: selectedUser?.profileImage }}
                style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 10, backgroundColor: "#eee" }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 18, color: theme.textPrimary }}>
                {selectedUser?.username}
              </Text>
              <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
                {selectedUser?.name || selectedUser?.email}
              </Text>
            </View>
            <Text style={{ color: theme.textPrimary, marginBottom: 6, marginTop: 8 }}>Trimite un mesaj (opțional):</Text>
            <TextInput
              style={[styles.friendInput, { backgroundColor: theme.textInputBackground, color: theme.textPrimary }]}
              placeholder="Scrie un mesaj..."
              placeholderTextColor={theme.textSecondary}
              value={friendRequestMessage}
              onChangeText={setFriendRequestMessage}
              multiline
              maxLength={120}
            />
            <TouchableOpacity
              style={[styles.sendBtn, sendingRequest && { opacity: 0.7 }]}
              onPress={handleSendFriendRequest}
              disabled={sendingRequest || requestSent}
            >
              {sendingRequest ? (
                <ActivityIndicator color="#fff" />
              ) : requestSent ? (
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Trimite cererea</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignSelf: "center" }} onPress={() => setSelectedUser(null)}>
              <Text style={{ color: theme.primary, fontWeight: "bold" }}>Anulează</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Lista de postări ale prietenilor */}
      {loadingPosts ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item: post }) => (
            <View style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.textPrimary }]}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: post.user?.profileImage || "https://ui-avatars.com/api/?name=Anonim" }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.username, { color: theme.textPrimary }]}>{post.user?.username}</Text>
                  <Text style={[styles.time, { color: theme.textSecondary }]}>{post.createdAt}</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={22} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              {/* Imagine postare */}
              <Image
                source={{ uri: post.imageUrl || post.image || "https://ui-avatars.com/api/?name=No+Image" }}
                style={styles.postImage}
                resizeMode="cover"
              />
              {/* Acțiuni */}
              <View style={styles.actionsRow}>
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={26} color={theme.textPrimary} style={{ marginRight: 12 }} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="chatbubble-outline" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              {/* Likes și descriere */}
              <Text style={[styles.likes, { color: theme.textPrimary }]}>{post.likes || 0} aprecieri</Text>
              <Text style={[styles.description, { color: theme.textPrimary }]}>
                <Text style={{ fontWeight: "bold" }}>{post.user?.username} </Text>
                {post.description}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.comments, { color: theme.textSecondary }]}>
                  Vezi toate cele {post.comments || 0} comentarii
                </Text>
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 0,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "relative",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  filterBtn: {
    marginLeft: 6,
    padding: 4,
    position: "relative",
  },
  dropdownModal: {
    position: "absolute",
    top: 36,
    right: 0,
    borderRadius: 8,
    elevation: 4,
    zIndex: 10,
    minWidth: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  friendModal: {
    width: 320,
    borderRadius: 18,
    padding: 22,
    alignItems: "stretch",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
  },
  friendInput: {
    borderRadius: 10,
    padding: 10,
    minHeight: 44,
    fontSize: 15,
    marginBottom: 12,
  },
  sendBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  card: {
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eee",
  },
  postImage: {
    width: "100%",
    height: 320,
    backgroundColor: "#ddd",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  likes: {
    fontWeight: "bold",
    marginHorizontal: 10,
    marginTop: 6,
  },
  description: {
    marginHorizontal: 10,
    marginTop: 2,
  },
  comments: {
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
  },
  username: {
    fontWeight: "bold",
    fontSize: 15,
  },
  time: {
    fontSize: 13,
    marginTop: 2,
  },
});