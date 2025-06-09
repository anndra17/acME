import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { getBlogPostById, likeBlogPost, unlikeBlogPost, getUsernameById } from "../../../lib/firebase-service";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSession } from "../../../context/index"; // Asumând că folosești o bibliotecă de autentificare

const { width } = Dimensions.get("window");

const BlogPostDetailScreen = () => {
  const { blogPostId } = useLocalSearchParams<{ blogPostId: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [authorUsername, setAuthorUsername] = useState<string | null>(null);
  const { user } = useSession();

  useEffect(() => {
    if (!blogPostId) return;
    const fetchPost = async () => {
      setLoading(true);
      const data = await getBlogPostById(blogPostId as string);
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [blogPostId]);

  useEffect(() => {
    if (post?.authorId) {
      getUsernameById(post.authorId).then(setAuthorUsername);
    }
  }, [post?.authorId]);

  const handleLike = async () => {
    if (!user?.uid || !post?.id || likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikeBlogPost(post.id, user.uid);
        setLiked(false);
      } else {
        await likeBlogPost(post.id, user.uid);
        setLiked(true);
      }
    } catch (e) {
      // poți afișa un mesaj de eroare
    }
    setLikeLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F8EF7" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Post not found.</Text>
      </View>
    );
  }

  let createdAtText = "";
  if (post.createdAt) {
    const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
    createdAtText = formatDistanceToNow(date, { addSuffix: true });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafe" }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {post.featuredImage && (
        <Image
          source={{ uri: post.featuredImage }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={[styles.card, { flex: 1 }]}>
        <View style={[styles.titleRow]}>
          <Text style={styles.title}>{post.title}</Text>
          <TouchableOpacity
            style={[styles.likeButtonSmall, liked && styles.liked]}
            onPress={handleLike}
            disabled={likeLoading}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#e74c3c" : "#888"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.author}>
            {authorUsername || "Unknown author"}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.date}>{createdAtText}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.content}>{post.content || post.summary}</Text>
        
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  centered: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafe"
  },
  notFound: {
    fontSize: 18,
    color: "#d00",
    fontWeight: "bold"
  },
  image: {
    width: width,
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: -24,
  },
  card: {
    backgroundColor: "#fff",
    marginTop: -16,
    marginHorizontal: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 300,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  author: {
    color: "#4F8EF7",
    fontWeight: "600",
    fontSize: 15,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d0d0d0",
    marginHorizontal: 8,
  },
  date: {
    color: "#888",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
    borderRadius: 1,
  },
  content: {
    fontSize: 17,
    color: "#333",
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f3f3f7",
  },
  liked: {
    backgroundColor: "#fdeaea",
  },
  likeText: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#888",
    fontSize: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  likeButtonSmall: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f3f3f7",
  },
});

export default BlogPostDetailScreen;