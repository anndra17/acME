import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal } from "react-native";
import { useSession } from "@/../context";
import { Colors } from "../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { User as FirebaseUser } from "firebase/auth";
import { getUserProfile, getBlogPosts, searchBlogPostsByTitle,toggleFavoriteBlogPost, listenToUserFavorites, incrementBlogPostViews, getMostViewedBlogPosts } from "../../../../lib/firebase-service";
import { BlogPost } from "../../../../types/BlogPost";
import { useRouter, useFocusEffect } from "expo-router";

// =================== HomeHeader ===================a
type HomeHeaderProps = { user: FirebaseUser | null };

const HomeHeader = ({ user }: HomeHeaderProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);


  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.uid) {
        try {
          const userData = await getUserProfile(user.uid);
          setProfileImage(userData.profileImage || null);
          setUsername(userData.username || null);
          setUserRole(userData.role || null);
          setFirstName(userData.firstName || null);
          setLastName(userData.lastName || null);
        } catch (e) {
          setProfileImage(null);
          setUsername(null);
          setUserRole(null);
          setFirstName(null);
          setLastName(null);
        }
      }
    };
    fetchProfileImage();
  }, [user?.uid]);

  const displayName =
    userRole === "doctor" && lastName
      ? lastName
      : username ||
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : "Guest") ||
        "Guest";
  const imageSrc =
    profileImage || user?.photoURL || "https://ui-avatars.com/api/?name=User";

  const getRolePrefix = () => {
    switch (userRole) {
      case "doctor":
        return "dr. ";
      case "moderator":
        return "moderator ";
      default:
        return "";
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.hiText}>
          Hi, {getRolePrefix()}
          <Text style={styles.nameText}>{displayName}</Text> 👋
        </Text>
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
type SearchBarWithFilterProps = { 
  onFilterPress: () => void;
  value: string;
  onChangeText: (text: string) => void;
};

const SearchBarWithFilter = ({ onFilterPress, value, onChangeText }: SearchBarWithFilterProps) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search topics"
      placeholderTextColor="#888"
      value={value}
      onChangeText={onChangeText}
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
type ForumHorizontalListProps = { 
  posts: BlogPost[]; 
  onToggleFavorite: (id: string) => void;
  onPostPress: (post: BlogPost) => void;
  userFavorites: string[];
  user: FirebaseUser | null; 
};

const getRelativeTimeString = (date: string) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return postDate.toLocaleDateString();
};



const ForumHorizontalList = ({ posts, onToggleFavorite, onPostPress, userFavorites, user }: ForumHorizontalListProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.forumList}
    contentContainerStyle={{ paddingLeft: 10, paddingRight: 4 }}
  >
    {posts.map((post) => (
      <TouchableOpacity 
        key={post.id} 
        style={styles.forumCard}
        onPress={() => onPostPress(post)}
      >
        <Image source={{ uri: post.featuredImage }} style={styles.forumImage} />
        <TouchableOpacity 
          style={styles.heartIcon}
          onPress={() => onToggleFavorite(post.id)}
        >
          <Ionicons
            name={userFavorites?.includes(post.id) ? "heart" : "heart-outline"}
            size={24}
            color={userFavorites?.includes(post.id) ? Colors.light.primary : "#fff"}
          />
        </TouchableOpacity>
        <View style={styles.forumInfo}>
          <Text style={styles.forumTitle}>{post.title}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#fff" style={styles.timeIcon} />
            <Text style={styles.forumSubtitle}>
              {getRelativeTimeString(post.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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

// =================== ModalViewAllForums ===================
type ModalViewAllForumsProps = { 
  visible: boolean; 
  onClose: () => void;
  posts: BlogPost[];
  onPostPress: (post: BlogPost) => void;
  onToggleFavorite: (id: string) => void;
};

const ModalViewAllForums = ({ visible, onClose, posts, onPostPress, onToggleFavorite }: ModalViewAllForumsProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>All Posts</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalScrollView}>
          {posts.map((post) => (
            <TouchableOpacity 
              key={post.id} 
              style={styles.modalPostCard}
              onPress={() => onPostPress(post)}
            >
              <Image source={{ uri: post.featuredImage }} style={styles.modalPostImage} />
              <View style={styles.modalPostContent}>
                <View style={styles.modalPostHeader}>
                  <Text style={styles.modalPostTitle} numberOfLines={2}>{post.title}</Text>
                  <TouchableOpacity 
                    style={styles.modalHeartIcon} 
                    onPress={() => onToggleFavorite(post.id)}
                  >
                    <Ionicons
                      name={post.likes?.includes(post.id) ? "heart" : "heart-outline"}
                      size={20}
                      color={post.likes?.includes(post.id) ? Colors.light.primary : "#666"}
                    />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalPostSummary} numberOfLines={2}>
                  {post.summary}
                </Text>

                {post.tags && post.tags.length > 0 && (
                  <View style={styles.modalTagsContainer}>
                    {post.tags.map((tag, index) => (
                      <View key={index} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalPostInfo}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={14} color="#666" style={styles.timeIcon} />
                    <Text style={styles.modalPostTime}>
                      {getRelativeTimeString(post.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// =================== Main Page ===================

const TabsIndexScreen = () => {
  const { user } = useSession();
  const router = useRouter();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("latest");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [selectedTab, lastRefresh,userFavorites]);

  useFocusEffect(
    React.useCallback(() => {
      setLastRefresh(Date.now());
    }, [])
  );

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = listenToUserFavorites(user.uid, (favorites) => {
      setUserFavorites(favorites);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      let filters = { isPublished: true };
      const fetchedPosts = await getBlogPosts(filters);

      switch (selectedTab) {
        case "favorites":
          setPosts(
          fetchedPosts.filter(post => userFavorites.includes(post.id))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
          break;
        case "mostViewed":
          break;
        case "latest":
        default:
          setPosts(
            fetchedPosts
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
          break;
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (postId: string) => {
    if (!user) return;
    try {
      const updatedFavorites = await toggleFavoriteBlogPost(user.uid, postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, isFavorite: updatedFavorites.includes(postId) }
            : post
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handlePostPress = async (post: BlogPost) => {
    if (user?.uid && post.authorId && user.uid !== post.authorId) {
      try {
        await incrementBlogPostViews(post.id);
      } catch (e) {
        console.warn("Nu s-a putut incrementa vizualizarea:", e);
      }
    }
    router.push(`../${post.id}`);
  };

  const handleMostViewedPress = async () => {
    setLoading(true);
    const mostViewed = await getMostViewedBlogPosts(20);
    setPosts(mostViewed);
    setLoading(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const all = await getBlogPosts({ isPublished: true });
        setAllPosts(all);
      } catch (e) {
        console.error("Error fetching all posts:", e);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchBlogPostsByTitle(text);
      setSearchResults(results);
    } catch (e) {
      setSearchResults([]);
    }
    setSearching(false);
  };



  return (
    <View style={styles.container}>
      <HomeHeader user={user} />
      <View style={{ position: "relative" }}>
        <SearchBarWithFilter
          onFilterPress={() => setFilterModalVisible(true)}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 1 && searchResults.length > 0 && (
          <View style={styles.dropdownContainer}>
            {searchResults.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSearchText("");
                  setSearchResults([]);
                  handlePostPress(post);
                }}
              >
                <Text style={styles.dropdownTitle}>{post.title}</Text>
                <Text style={styles.dropdownSubtitle} numberOfLines={1}>
                  {post.summary}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <PopularTopicsHeader onViewAll={() => setViewAllModalVisible(true)} />
      <ForumTabs
        selected={selectedTab}
        onSelect={(key) => {
          setSelectedTab(key);
          if (key === "mostViewed") {
            handleMostViewedPress(); 
          } else {
            setLastRefresh(Date.now());
          }
        }}
      />
      {searchText.length <= 1 && (
        loading ? (
          <View style={styles.loadingContainer}><Text>Loading posts...</Text></View>
        ) : (
          <ForumHorizontalList
            posts={posts}
            onToggleFavorite={handleToggleFavorite}
            onPostPress={handlePostPress}
            userFavorites={userFavorites}
            user={user}
          />
        )
      )}
      <ModalFilter visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
      <ModalViewAllForums 
        visible={viewAllModalVisible} 
        onClose={() => setViewAllModalVisible(false)}
        posts={allPosts} 
        onPostPress={handlePostPress}
        onToggleFavorite={handleToggleFavorite}
      />
      
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeIcon: {
    marginRight: 4,
  },
  forumSubtitle: {
    color: "#fff",
    fontSize: 14,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    marginHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    padding: 16,
  },
  modalPostCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalPostImage: {
    width: 120,
    height: 160,
    resizeMode: "cover",
  },
  modalPostContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  modalPostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  modalPostTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  modalPostSummary: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  modalTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  modalTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalTagText: {
    fontSize: 12,
    color: "#666",
  },
  modalPostInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalPostTime: {
    fontSize: 12,
    color: "#666",
  },
  modalHeartIcon: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 340,
  },
  dropdownContainer: {
    position: "absolute",
    top: 70, 
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
    maxHeight: 260,
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  dropdownSubtitle: {
    fontSize: 13,
    color: "#888",
  },
});

export default TabsIndexScreen;