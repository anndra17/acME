import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal } from "react-native";
import { useSession } from "@/../context";
import { Colors } from "../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { User as FirebaseUser } from "firebase/auth";

// =================== HomeHeader ===================
type HomeHeaderProps = { user: FirebaseUser | null };
const HomeHeader = ({ user }: HomeHeaderProps) => (
  <View style={styles.headerContainer}>
    <View>
      <Text style={styles.hiText}>Hi, <Text style={styles.nameText}>{user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest') || 'Guest'}</Text> 👋</Text>
      <Text style={styles.welcomeText}>Welcome back!</Text>
    </View>
    <Image
      source={{ uri: user?.photoURL || "https://ui-avatars.com/api/?name=User" }}
      style={styles.profileImage}
    />
  </View>
);

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
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forumList}>
    {forums.map((forum: Forum) => (
      <View key={forum.id} style={styles.forumCard}>
        <Image source={{ uri: forum.image }} style={styles.forumImage} />
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => onToggleFavorite(forum.id)}
        >
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
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  hiText: { fontSize: 24, fontWeight: "bold", color: Colors.light.primary },
  nameText: { color: Colors.light.primary },
  welcomeText: { fontSize: 16, color: "#888" },
  profileImage: { width: 48, height: 48, borderRadius: 24, marginLeft: 8 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.light.primary },
  searchInput: { flex: 1, height: 40, fontSize: 16 },
  filterButton: { marginLeft: 8, padding: 4 },
  popularHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  popularText: { fontSize: 18, fontWeight: "bold" },
  viewAllText: { color: Colors.light.primary, fontWeight: "bold" },
  tabsContainer: { flexDirection: "row", marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4, alignItems: "center" },
  tabPrimary: { backgroundColor: Colors.light.primary },
  tabSecondary: { backgroundColor: "#f3f3f3" },
  tabTextPrimary: { color: "#fff", fontWeight: "bold" },
  tabTextSecondary: { color: Colors.light.primary, fontWeight: "bold" },
  forumList: { marginBottom: 16 },
  forumCard: { width: 220, marginRight: 16, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", elevation: 2 },
  forumImage: { width: "100%", height: 120 },
  heartIcon: { position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 16, padding: 4 },
  forumInfo: { padding: 12 },
  forumTitle: { fontSize: 16, fontWeight: "bold" },
  forumSubtitle: { fontSize: 12, color: "#888", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 24, borderRadius: 16, width: "80%" },
});

export default TabsIndexScreen;