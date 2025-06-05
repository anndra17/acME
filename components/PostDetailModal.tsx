// components/PostDetailsModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { deletePostAndImage } from "../lib/firebase-service";
import { Colors } from "../constants/Colors";
import { LinearGradient } from 'expo-linear-gradient';
import { Post } from '../types/Post';

const { width, height } = Dimensions.get('window');


type Props = {
  visible: boolean;
  onClose: () => void;
  posts: Post[];
  initialIndex: number;
  onDelete?: (deletedPostId: string) => void;
};

const ITEM_WIDTH = width;

const theme = Colors.light; // sau poți face dinamic dacă ai dark mode

const PostDetailsModal: React.FC<Props> = ({ visible, onClose, posts, initialIndex, onDelete }) => {
  const flatListRef = useRef<FlatList>(null);
  
  // Folosim un ref pentru a stoca valoarea inițială a initialIndex când modalul devine vizibil
  const initialIndexRef = useRef(initialIndex);
  
  // Actualizăm ref-ul când se schimbă initialIndex și modalul este vizibil
  useEffect(() => {
    if (visible) {
      initialIndexRef.current = initialIndex;
    }
  }, [initialIndex, visible]);

  // Când modalul devine vizibil, scrolare la indexul inițial
  useEffect(() => {
    if (visible && posts.length > 0 && flatListRef.current) {
      // Adăugăm un timeout pentru a ne asigura că FlatList este complet renderizat
      // înainte de a încerca să facem scroll
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
  const post = posts[initialIndex];

  const handleDelete = async () => {
    Alert.alert(
      "Confirmare",
      "Ești sigur că vrei să ștergi această postare?",
      [
        { text: "Anulează", style: "cancel" },
        {
          text: "Șterge",
          style: "destructive",
          onPress: async () => {
            await deletePostAndImage(post.id, post.imageUrl);
            onClose();
            if (onDelete) onDelete(post.id);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <View style={styles.infoSection}>
          <Text style={styles.label}>
            <Text style={styles.bold}>Description: </Text>
            {item.description || 'N/A'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="barbell-outline" size={16} color={theme.primary} />
              <Text style={styles.badgeText}>Stress: {item.stressLevel}</Text>
            </View>
            {item.treatmentUsed && (
              <View style={styles.badge}>
                <Ionicons name="medkit-outline" size={16} color={theme.primary} />
                <Text style={styles.badgeText}>{item.treatmentUsed}</Text>
              </View>
            )}
          </View>
          {item.skinConditions && item.skinConditions.length > 0 && (
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="leaf-outline" size={16} color={theme.primary} />
                <Text style={styles.badgeText}>{item.skinConditions.join(', ')}</Text>
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={{ flex: 1 }}>
        {/* Overlay cu gradient */}
        <LinearGradient
          colors={["rgba(0,0,0,0.25)", Colors.light.buttonBackground, Colors.light.primary]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", zIndex: 2 }}>
          <FlatList
            ref={flatListRef}
            data={posts}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              console.log('Failed to scroll to index', info);
              // Retry with a delay
              setTimeout(() => {
                if (posts.length > 0 && flatListRef.current) {
                  flatListRef.current.scrollToIndex({
                    index: Math.min(Math.max(0, info.index), posts.length - 1),
                    animated: false
                  });
                }
              }, 200);
            }}
            renderItem={renderItem}
          />

          {/* Butonul cu 3 puncte */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              zIndex: 20,
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 20,
              padding: 6,
            }}
            onPress={() => setShowOptions(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Meniul de opțiuni */}
          <Modal visible={showOptions} transparent animationType="fade">
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setShowOptions(false)}
              activeOpacity={1}
            >
              <View
                style={{
                  position: "absolute",
                  top: 60,
                  right: 24,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowOptions(false);
                    handleDelete();
                  }}
                  style={{ paddingVertical: 8 }}
                >
                  <Text style={{ color: "red", fontWeight: "bold" }}>Șterge postare</Text>
                </TouchableOpacity>
                {/* Poți adăuga și alte opțiuni aici */}
              </View>
            </TouchableOpacity>
          </Modal>
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