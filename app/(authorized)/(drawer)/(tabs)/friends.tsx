import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable, ActivityIndicator, Animated, Alert } from "react-native";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useColorScheme } from "react-native";
import { AppUser, searchUsers, sendFriendRequest, getFriendsIds, getFriendsPosts, likePost, unlikePost, getPostComments, addComment, checkIfUserLikedPost, getLikesCount, getCommentsCount } from "../../../../lib/firebase-service"; // asigură-te că ai această funcție
import { useSession } from "@/../context";


const FILTERS = [
  { label: "Username", value: "username" },
  { label: "Name", value: "name" },
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
  const [showSearchBar, setShowSearchBar] = useState(false);

  
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [friendRequestMessage, setFriendRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const { user } = useSession();

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [commentsPostOwnerId, setCommentsPostOwnerId] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(100)).current; 
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
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
        setShowSearchBar(false); 
        setSearch("");           
      }, 1500);
    } catch (e) {
      setSendingRequest(false);
      // poți afișa un toast/alert aici
    }
  };

  // Adaugă un comentariu
  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !commentsPostId || !commentsPostOwnerId) return;
    try {
      await addComment(commentsPostId, user.uid, commentText, commentsPostOwnerId);
      setComments(prev => [
        ...prev,
        {
          id: Math.random().toString(), 
          userId: user.uid,
          username: user.displayName || user.email,
          userProfileImage: user.photoURL || "https://ui-avatars.com/api/?name=Anonim",
          text: commentText,
          createdAt: new Date().toISOString(),
        }
      ]);
      setCommentText("");
    } catch (e) {
      Alert.alert("Error", "Could not add comment. Please try again later.");
    }
  };

  const handleLike = async (post: any) => {
    if (!user) return;
    try {
      if (post.likedByCurrentUser) {
        await unlikePost(post.id, user.uid);
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? {
                  ...p,
                  likedByCurrentUser: false,
                  likes: Math.max(0, (p.likes || 1) - 1), // asigură că nu scade sub 0
                }
              : p
          )
        );
      } else {
    await likePost(post.id, user.uid, post.user.userId || post.userId);        
      setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? {
                  ...p,
                  likedByCurrentUser: true,
                  likes: (p.likes || 0) + 1,
                }
              : p
          )
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not like/unlike post. Please try again later.");
    }
  };

  const openCommentsModal = async (post: any) => {
    setShowCommentsModal(true);
    setCommentsPostId(post.id);
    setCommentsPostOwnerId(post.user?.id || post.userId);
    setComments([]); // curăță comentariile vechi
    try {
      const commentsList = await getPostComments(post.id);
      setComments(commentsList);
    } catch (e) {
      Alert.alert("Error", "Could not load comments. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchFriendsPosts = async () => {
      if (!user) return;
      setLoadingPosts(true);
      try {
        const friendIds = await getFriendsIds(user.uid);
        const friendsPosts = await getFriendsPosts(friendIds);

        const postsWithLikes = await Promise.all(
          friendsPosts.map(async (post) => {
            const likedByCurrentUser = await checkIfUserLikedPost(post.id, user.uid);
            const likes = await getLikesCount(post.id);
            const comments = await getCommentsCount(post.id); // ← adaugă această linie
            return {
              ...post,
              likedByCurrentUser,
              likes,
              comments, // ← numărul de comentarii
            };
          })
        );
        setPosts(postsWithLikes);
      } catch (e) {
        Alert.alert("Error", "Could not load friends' posts. Please try again later.");
      }
      setLoadingPosts(false);
    };
    fetchFriendsPosts();
  }, [user]);

  useEffect(() => {
    if (showCommentsModal) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
    }
  }, [showCommentsModal]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* SearchBar */}
      <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        zIndex: 1,
        justifyContent: "flex-end",
        backgroundColor: "transparent",
        paddingRight: 12, 
      }}
    >
  {!showSearchBar && (
    <TouchableOpacity
      style={{
        backgroundColor: theme.primary,
        borderRadius: 22,
        padding: 10,
        marginBottom:-40,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end", 
      }}
      onPress={() => setShowSearchBar(true)}
    >
      <Ionicons name="person-add-outline" size={22} color="#fff" />
    </TouchableOpacity>
  )}
</View>
      {showSearchBar && (
        <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border, marginBottom:10, zIndex:1 }]}>
          <View style={{ position: "relative", flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginHorizontal: 8 }} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder={`Search by ${FILTERS.find(f => f.value === filter)?.label.toLowerCase()}...`}
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
          <TouchableOpacity onPress={() => {
            setShowSearchBar(false);
            setSearch(""); 
          }} style={{ marginLeft: 8 }}>
                      <Ionicons name="close" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}

      {/* Rezultate căutare */}
      {search.length > 1 && (
  <View
    style={{
      position: "absolute",
      top: 70,
      left: 16,
      right: 16,
      zIndex: 10,
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.tabIconDefault,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 8,
      maxHeight: 320,
    }}
  >
    <FlatList
      data={searchResults}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setSelectedUser(item)}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            backgroundColor: "transparent",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}>
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
      style={{ borderRadius: 16 }}
    />
  </View>
)}

      {/* Modal cerere de prietenie */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => {
          setSelectedUser(null);
          setShowSearchBar(false); 
          setSearch("");          
        }}>
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
            <Text style={{ color: theme.textPrimary, marginBottom: 6, marginTop: 8 }}>Send a message (optional):</Text>
            <TextInput
              style={[styles.friendInput, { backgroundColor: theme.textInputBackground, color: theme.textPrimary }]}
              placeholder="Write a message..."
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
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Send request</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignSelf: "center" }} onPress={() => setSelectedUser(null)}>
              <Text style={{ color: theme.primary, fontWeight: "bold" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal comentarii */}
      <Modal
        visible={showCommentsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <Pressable
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.18)",
      justifyContent: "flex-end",
      alignItems: "center",
    }}
    onPress={() => setShowCommentsModal(false)}
  >
    <Animated.View
      style={{
        width: "100%",
        backgroundColor: theme.cardBackground,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingVertical: 8,
        maxHeight: Math.min(420, comments.length * 64 + 120),
        minHeight: 120,
        alignSelf: "center",
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
      onStartShouldSetResponder={() => true}
      onTouchEnd={e => e.stopPropagation()}
    >
      <FlatList
              data={comments}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: theme.cardBackground,
                    borderRadius: 14,
                    marginHorizontal: 12,
                    marginVertical: 6,
                    padding: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: theme.primary,
                      borderRadius: 18,
                      padding: 2,
                      marginRight: 10,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          item.userProfileImage ||
                          item.profileImage ||
                          "https://ui-avatars.com/api/?name=" + (item.username || "Anonim"),
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#eee",
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold", color: theme.primary, marginBottom: 2 }}>
                      {item.username}
                    </Text>
                    <Text style={{ color: theme.textPrimary }}>{item.text}</Text>
                  </View>
                </View>
              )}
              keyExtractor={item => item.id}
            />
            <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  borderWidth: 0,
                  borderRadius: 18,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  backgroundColor: theme.textInputBackground || "#f3f4f6",
                  fontSize: 15,
                  color: theme.textPrimary,
                }}
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentText.trim()}
                style={{
                  marginLeft: 6,
                  opacity: commentText.trim() ? 1 : 0.5,
                  padding: 6,
                  borderRadius: 16,
                }}
              >
                <Ionicons name="send" size={22} color={theme.primary} />
              </TouchableOpacity>
            </View>
        </Animated.View>
      </Pressable>
      </Modal>

      {loadingPosts ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : posts.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 48, paddingHorizontal: 24 }}>
          <Ionicons name="people-outline" size={54} color={theme.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={{ color: theme.textPrimary, fontWeight: "bold", fontSize: 18, textAlign: "center", marginBottom: 8 }}>
            You don't have any friends yet.
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 16, textAlign: "center" }}>
            To add friends, tap the <Ionicons name="person-add-outline" size={18} color={theme.primary} /> button in the top right corner.
          </Text>
        </View>
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
                  <Text style={[styles.time, { color: theme.textSecondary, flexDirection: "row", alignItems: "center" }]}>
                    {formatDistanceToNow(
                      typeof post.createdAt === "string" ? parseISO(post.createdAt) : new Date(post.createdAt?.seconds * 1000),
                      { addSuffix: true }
                    )}
                  </Text>
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
                <TouchableOpacity onPress={() => handleLike(post)}>
                  <Ionicons
                    name={post.likedByCurrentUser ? "heart" : "heart-outline"}
                    size={26}
                    color={post.likedByCurrentUser ? "#e74c3c" : theme.textPrimary}
                    style={{ marginRight: 12 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openCommentsModal(post)}>
                  <Ionicons name="chatbubble-outline" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              {/* Likes și descriere */}
              <Text style={[styles.likes, { color: theme.textPrimary }]}>{post.likes || 0} aprecieri</Text>
              <Text style={[styles.description, { color: theme.textPrimary }]}>
                <Text style={{ fontWeight: "bold" }}>{post.user?.username} </Text>
                {post.description}
              </Text>
              <TouchableOpacity onPress={() => openCommentsModal(post)}>
                <Text style={[styles.comments, { color: theme.textSecondary }]}>
                  View all {post.comments || 0} comments
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
    marginBottom: 6, 
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