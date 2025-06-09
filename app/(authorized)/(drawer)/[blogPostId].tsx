import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { getBlogPostById } from "../../../lib/firebase-service";

const { width } = Dimensions.get("window");

const BlogPostDetailScreen = () => {
  const { blogPostId } = useLocalSearchParams<{ blogPostId: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.title}>{post.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.author}>{post.author || "Unknown author"}</Text>
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
});

export default BlogPostDetailScreen;