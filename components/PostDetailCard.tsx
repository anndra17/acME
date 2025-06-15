import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { getLikesCount, getPostComments, updatePostMetadata } from "../lib/firebase-service";
import { Post } from "../types/Post";
import { Colors } from "../constants/Colors";
import PostModal from "./PostModal"; // Import if not already

const { width } = Dimensions.get("window");
const theme = Colors.light;

const PostDetailCard = ({ post, onDelete }: { post: Post; onDelete?: () => void }) => {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingComments(true);
    getLikesCount(post.id).then(count => mounted && setLikesCount(count));
    getPostComments(post.id)
      .then(comments => mounted && setComments(comments))
      .finally(() => mounted && setLoadingComments(false));
    return () => { mounted = false; };
  }, [post.id]);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View>
          <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
              backgroundColor: "rgba(0,0,0,0.18)",
              borderRadius: 18,
              padding: 6,
            }}
            onPress={() => setShowOptions(true)}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Options menu */}
          {showOptions && (
            <View
              style={{
                position: "absolute",
                top: 44,
                right: 12,
                backgroundColor: "#fff",
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 16,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  setShowEditModal(true);
                }}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: "#222", fontWeight: "bold" }}>Edit post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  onDelete && onDelete();
                }}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: "red", fontWeight: "bold" }}>Delete post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: "#222" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>
            <Text style={styles.bold}>Description: </Text>
            {post.description || 'N/A'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="barbell-outline" size={16} color={theme.primary} />
              <Text style={styles.badgeText}>Stress: {post.stressLevel}</Text>
            </View>
            {post.treatmentUsed && (
              <View style={styles.badge}>
                <Ionicons name="medkit-outline" size={16} color={theme.primary} />
                <Text style={styles.badgeText}>{post.treatmentUsed}</Text>
              </View>
            )}
          </View>
          {post.skinConditions && post.skinConditions.length > 0 && (
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="leaf-outline" size={16} color={theme.primary} />
                <Text style={styles.badgeText}>{post.skinConditions.join(', ')}</Text>
              </View>
            </View>
          )}
          {post.reviewed && post.feedback && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#e6f7ee', borderRadius: 8, padding: 8 }}>
              <FontAwesome name="user-md" size={18} color="#1a7f5a" style={{ marginRight: 6 }} />
              <Text style={{ color: '#1a7f5a', fontSize: 15, fontStyle: 'italic' }}>
                {post.feedback}
              </Text>
            </View>
          )}

          {/* Likes & comments like Instagram */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 6 }}>
            <Ionicons name="heart-outline" size={26} color="#d11a2a" style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: "bold", fontSize: 16, marginRight: 18 }}>{likesCount}</Text>
            <Ionicons name="chatbubble-outline" size={24} color="#222" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, color: "#222" }}>{comments.length}</Text>
          </View>

          {/* Comments */}
          <View style={{ marginTop: 8, maxHeight: showComments ? 120 : undefined }}>
            {!showComments ? (
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: "bold",
                  fontSize: 15,
                  paddingVertical: 8,
                }}
                onPress={() => setShowComments(true)}
              >
                View comments ({comments.length})
              </Text>
            ) : loadingComments ? (
              <ActivityIndicator />
            ) : comments.length === 0 ? (
              <Text style={{ color: "#888", fontSize: 15 }}>No comments yet.</Text>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 220 }}
                renderItem={({ item: comment }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                      backgroundColor: "#fafafa",
                      borderRadius: 12,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Image
                      source={{ uri: comment.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username || "Anonymous")}` }}
                      style={{ width: 26, height: 26, borderRadius: 16, marginRight: 10, backgroundColor: "#eee" }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold", color: "#222", fontSize: 15 }}>
                        {comment.username}
                      </Text>
                      <Text style={{ color: "#222", fontSize: 15 }}>{comment.text}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </View>

      {/* Edit Post Modal */}
      <PostModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        imageUri={post.imageUrl}
        initialValues={{
          description: post.description,
          stressLevel: post.stressLevel,
          skinConditions: post.skinConditions,
          treatmentUsed: post.treatmentUsed,
        }}
        onSubmit={async (data) => {
          await updatePostMetadata(post.id, data);
          setShowEditModal(false);
          // Optionally, refresh post data here
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'transparent',
  },
  card: {
    width: width * 0.88,
    backgroundColor: theme.background,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 320,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  infoSection: {
    padding: 20,
  },
  label: {
    marginTop: 6,
    fontSize: 16,
    color: theme.textPrimary,
  },
  bold: {
    fontWeight: 'bold',
    color: theme.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.textInputBackground,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    marginLeft: 4,
    color: theme.textPrimary,
    fontSize: 14,
  },
});

export default PostDetailCard;