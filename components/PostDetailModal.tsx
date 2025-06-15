// components/PostDetailsModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  FlatList,
  View,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { deletePostAndImage, getLikesCount, getPostComments } from "../lib/firebase-service";
import { Colors } from "../constants/Colors";
import { LinearGradient } from 'expo-linear-gradient';
import { Post } from '../types/Post';
import PostDetailCard from './PostDetailCard';

const { width } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  posts: Post[];
  initialIndex: number;
  onDelete?: (deletedPostId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void; // <-- adaugă această linie
};

const ITEM_WIDTH = width;

const theme = Colors.light; // or make it dynamic if you have dark mode

const PostDetailsModal: React.FC<Props> = ({ visible, onClose, posts, initialIndex, onDelete }) => {
  const flatListRef = useRef<FlatList>(null);

  // Use a ref to store the initial value of initialIndex when the modal becomes visible
  const initialIndexRef = useRef(initialIndex);

  // Update the ref when initialIndex changes and modal is visible
  useEffect(() => {
    if (visible) {
      initialIndexRef.current = initialIndex;
    }
  }, [initialIndex, visible]);

  // When modal becomes visible, scroll to the initial index
  useEffect(() => {
    if (visible && posts.length > 0 && flatListRef.current) {
      // Add a timeout to ensure FlatList is fully rendered before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndexRef.current,
          animated: false,
          viewPosition: 0
        });
      }, 100);
    }
  }, [visible, posts.length]);

  const [showOptions, setShowOptions] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [postsState, setPostsState] = useState(posts);
  const post = posts[initialIndex];

  useEffect(() => {
    if (!post?.id) return;
    setLoadingComments(true);
    getLikesCount(post.id).then(setLikesCount);
    getPostComments(post.id)
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [post?.id]);

  useEffect(() => {
    setPostsState(posts);
  }, [posts]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={{ flex: 1 }}>
        {/* Overlay with gradient */}
        <LinearGradient
          colors={["rgba(0,0,0,0.25)", Colors.light.buttonBackground, Colors.light.primary]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", zIndex: 2 }}>
          <FlatList
            ref={flatListRef}
            data={postsState}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <PostDetailCard
                post={item}
                onDelete={async () => {
                  Alert.alert(
                    "Confirmation",
                    "Are you sure you want to delete this post?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          await deletePostAndImage(item.id, item.imageUrl);
                          onClose();
                          if (onDelete) onDelete(item.id);
                        },
                      },
                    ]
                  );
                }}
                onPostUpdated={(updatedPost) => {
                  setPostsState((prev) =>
                    prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                  );
                }}
              />
            )}
          />

        </View>
      </View>
    </Modal>
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
  closeButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: theme.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  closeText: {
    color: theme.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostDetailsModal;