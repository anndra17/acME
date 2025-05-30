import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import Button from '../../../../components/Button';
import { BlogPost } from '../../../../types/BlogPost';
import { getBlogPosts, deleteBlogPost, updateBlogPost } from '../../../../lib/firebase-service';

const BlogPosts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getBlogPosts();
      setPosts(fetchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBlogPost(postId);
              setPosts(posts.filter(post => post.id !== postId));
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const handlePublish = async (post: BlogPost) => {
    try {
      await updateBlogPost(post.id, { isPublished: true });
      setPosts(posts.map(p => p.id === post.id ? { ...p, isPublished: true } : p));
      Alert.alert('Success', 'Post published successfully');
    } catch (error) {
      console.error('Error publishing post:', error);
      Alert.alert('Error', 'Failed to publish post');
    }
  };

  const handleUnpublish = async (post: BlogPost) => {
    try {
      await updateBlogPost(post.id, { isPublished: false });
      setPosts(posts.map(p => p.id === post.id ? { ...p, isPublished: false } : p));
      Alert.alert('Success', 'Post unpublished successfully');
    } catch (error) {
      console.error('Error unpublishing post:', error);
      Alert.alert('Error', 'Failed to unpublish post');
    }
  };

  const renderPost = ({ item: post }: { item: BlogPost }) => (
    <View style={styles.postCard}>
      <Image source={{ uri: post.featuredImage }} style={styles.postImage} />
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <View style={styles.postStatus}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: post.isPublished ? '#4CAF50' : '#FFA000' }
            ]}>
              <Text style={styles.statusText}>
                {post.isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.postSummary} numberOfLines={2}>
          {post.summary}
        </Text>

        <View style={styles.postMeta}>
          <Text style={styles.postDate}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.postCategory}>
            {post.category.replace('-', ' ')}
          </Text>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/moderator/blog-editor?id=${post.id}`)}
          >
            <Ionicons name="create-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          {post.isPublished ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUnpublish(post)}
            >
              <Ionicons name="eye-off-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Unpublish</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePublish(post)}
            >
              <Ionicons name="eye-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Publish</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(post.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
     

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={post => post.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No blog posts yet</Text>
              <Text style={styles.emptySubtext}>Create your first post by clicking the "New Post" button above</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  postStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteText: {
    color: '#ff4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default BlogPosts; 