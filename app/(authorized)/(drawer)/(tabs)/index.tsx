import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal } from "react-native";
import { useSession } from "@/../context";
import { Colors } from "../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { User as FirebaseUser } from "firebase/auth";
import { getUserProfile } from "../../../../lib/firebase-service";

// =================== HomeHeader ===================
type HomeHeaderProps = { user: FirebaseUser | null };
const HomeHeader = ({ user }: HomeHeaderProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.uid) {
        try {
          const userData = await getUserProfile(user.uid);
          setProfileImage(userData.profileImage || null);
          setUsername(userData.username || null);
        } catch (e) {
          setProfileImage(null);
          setUsername(null);
        }
      }
    };
    fetchProfileImage();
  }, [user?.uid]);

  const displayName = username || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest') || 'Guest';
  const imageSrc = profileImage || user?.photoURL || "https://ui-avatars.com/api/?name=User";

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.hiText}>Hi, <Text style={styles.nameText}>{displayName}</Text> 👋</Text>
        <Text style={styles.welcomeText}>Welcome back!</Text>
      </View>
      <Image
        source={{ uri: imageSrc }}
        style={styles.profileImage}
      />
    </View>
  );
};

// =================== SearchBarWithFilter ===================
type SearchBarWithFilterProps = { onFilterPress: () => void };
const SearchBarWithFilter = ({ onFilterPress }: SearchBarWithFilterProps) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search topics"
      placeholderTextColor="#888"
    />
    <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
      <Ionicons name="options-outline" size={24} color={Colors.light.primary} />
    </TouchableOpacity>
  </View>
);

// =================== PopularTopicsHeader ===================
type PopularTopicsHeaderProps = { onViewAll: () => void };
const PopularTopicsHeader = ({ onViewAll }: PopularTopicsHeaderProps) => (
  <View style={styles.popularHeader}>
    <Text style={styles.popularText}>Popular topics</Text>
    <TouchableOpacity onPress={onViewAll}>
      <Text style={styles.viewAllText}>View all</Text>
    </TouchableOpacity>
  </View>
);

// =================== ForumTabs ===================
const TABS = [
  { key: "favorites", label: "Favorites" },
  { key: "mostViewed", label: "Most Viewed" },
  { key: "latest", label: "Latest" },
];

type ForumTabsProps = { selected: string; onSelect: (key: string) => void };
const ForumTabs = ({ selected, onSelect }: ForumTabsProps) => (
  <View style={styles.tabsContainer}>
    {TABS.map(tab => (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tabButton,
          selected === tab.key ? styles.tabPrimary : styles.tabSecondary,
        ]}
        onPress={() => onSelect(tab.key)}
      >
        <Text style={selected === tab.key ? styles.tabTextPrimary : styles.tabTextSecondary}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// =================== ForumHorizontalList ===================
const MOCK_FORUMS = [
  {
    id: 1,
    title: "Acne Scars Products",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    lastAccessed: "Today",
    rating: 4.8,
    isFavorite: false,
  },
  {
    id: 1,
    title: "Acne Scars Products",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    lastAccessed: "Today",
    rating: 4.8,
    isFavorite: false,
  },
  // ...adauga mai multe forumuri mock
];

type Forum = {
  id: number;
  title: string;
  image: string;
  lastAccessed: string;
  rating: number;
  isFavorite: boolean;
};

type ForumHorizontalListProps = { forums: Forum[]; onToggleFavorite: (id: number) => void };
const ForumHorizontalList = ({ forums, onToggleFavorite }: ForumHorizontalListProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.forumList}
    contentContainerStyle={{ paddingLeft: 10, paddingRight: 4 }}
  >
    {forums.map((forum: Forum) => (
      <View key={forum.id} style={styles.forumCard}>
        <Image source={{ uri: forum.image }} style={styles.forumImage} />
        <TouchableOpacity style={styles.heartIcon} onPress={() => onToggleFavorite(forum.id)}>
          <Ionicons
            name={forum.isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={forum.isFavorite ? Colors.light.primary : "#fff"}
          />
        </TouchableOpacity>
        <View style={styles.forumInfo}>
          <Text style={styles.forumTitle}>{forum.title}</Text>
          <Text style={styles.forumSubtitle}>{forum.lastAccessed}</Text>
        </View>
      </View>
    ))}
  </ScrollView>
);

// =================== ModalFilter & ModalViewAllForums ===================
type ModalFilterProps = { visible: boolean; onClose: () => void };
const ModalFilter = ({ visible, onClose }: ModalFilterProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text>Filter options here...</Text>
        <TouchableOpacity onPress={onClose}><Text>Close</Text></TouchableOpacity>
      </View>
    </View>
  </Modal>
);

type ModalViewAllForumsProps = { visible: boolean; onClose: () => void };
const ModalViewAllForums = ({ visible, onClose }: ModalViewAllForumsProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text>All forums here...</Text>
        <TouchableOpacity onPress={onClose}><Text>Close</Text></TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// =================== Main Page ===================
const TabsIndexScreen = () => {
  const { user } = useSession();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("favorites");
  const [forums, setForums] = useState<Forum[]>(MOCK_FORUMS);

  const handleToggleFavorite = (id: number) => {
    setForums(forums =>
      forums.map(f =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      )
    );
  };

  return (
    <View style={styles.container}>
      <HomeHeader user={user} />
      <SearchBarWithFilter onFilterPress={() => setFilterModalVisible(true)} />
      <PopularTopicsHeader onViewAll={() => setViewAllModalVisible(true)} />
      <ForumTabs selected={selectedTab} onSelect={setSelectedTab} />
      <ForumHorizontalList forums={forums} onToggleFavorite={handleToggleFavorite} />
      <ModalFilter visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
      <ModalViewAllForums visible={viewAllModalVisible} onClose={() => setViewAllModalVisible(false)} />
    </View>
  );
};

// =================== Styles ===================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, padding: 16 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  hiText: { fontSize: 28, fontWeight: "bold", color: Colors.light.primary },
  nameText: { color: Colors.light.primary },
  welcomeText: { fontSize: 18, color: "#888", marginTop: 2 },
  profileImage: { width: 56, height: 56, borderRadius: 28, marginLeft: 8 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, marginBottom: 32, marginTop: 24, borderWidth: 1, borderColor: Colors.light.primary },
  searchInput: { flex: 1, height: 44, fontSize: 18 },
  filterButton: { marginLeft: 8, padding: 4 },
  popularHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 0,
  },
  popularText: { fontSize: 18, fontWeight: "bold" },
  viewAllText: { color: Colors.light.primary, fontWeight: "bold", fontSize: 16 },
  tabsContainer: { flexDirection: "row", marginBottom: 18, marginTop: 8 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 20, marginHorizontal: 4, alignItems: "center" },
  tabPrimary: { backgroundColor: Colors.light.primary },
  tabSecondary: { backgroundColor: "#f3f3f3" },
  tabTextPrimary: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  tabTextSecondary: { color: Colors.light.primary, fontWeight: "bold", fontSize: 16 },
  forumList: { marginBottom: 16, minHeight: 340 },
  forumCard: {
    width: 260,
    height: 340,
    marginRight: 20,
    backgroundColor: "#fff",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  forumImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  heartIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18,
    padding: 8,
    zIndex: 10,
  },
  forumInfo: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: "rgba(60,40,30,0.7)",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  forumTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  forumSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 24, borderRadius: 16, width: "80%" },
});

export default TabsIndexScreen;