import React, { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useColorScheme } from "react-native";

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

  // Pentru demo, filtrăm doar local pe useri hardcodați
  const filteredPosts = MOCK_POSTS.filter((post) => {
    const val = search.toLowerCase();
    if (!val) return true;
    if (filter === "username") return post.user.username.toLowerCase().includes(val);
    if (filter === "name") return post.user.name.toLowerCase().includes(val);
    if (filter === "email") return post.user.email.toLowerCase().includes(val);
    return true;
  });

  const renderPost = ({ item }: { item: FriendPost }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.textPrimary }]}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.username, { color: theme.textPrimary }]}>{item.user.username}</Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{item.createdAt}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      <Image source={{ uri: item.image }} style={styles.postImage} />
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
            onChangeText={setSearch}
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

      {/* Lista de postări */}
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
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