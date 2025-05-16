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
import { Ionicons } from "@expo/vector-icons";
import { deletePostAndImage } from "../lib/firebase-service";

const { width, height } = Dimensions.get('window');

type Post = {
  id: string;
  imageUrl: string;
  description?: string;
  stressLevel: number;
  skinConditions?: string[];
  treatmentUsed?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  posts: Post[];
  initialIndex: number;
  onDelete?: (deletedPostId: string) => void;
};

const ITEM_WIDTH = width;

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
    <ScrollView style={styles.card}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image} 
        resizeMode="cover" 
      />
      <Text style={styles.label}>
        <Text style={styles.bold}>Description:</Text> {item.description || 'N/A'}
      </Text>
      <Text style={styles.label}>
        <Text style={styles.bold}>Stress Level:</Text> {item.stressLevel}
      </Text>
      <Text style={styles.label}>
        <Text style={styles.bold}>Skin Conditions:</Text> {item.skinConditions?.join(', ') || 'N/A'}
      </Text>
      <Text style={styles.label}>
        <Text style={styles.bold}>Treatment:</Text> {item.treatmentUsed || 'N/A'}
      </Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal 
      visible={visible} 
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  card: { 
    width, 
    padding: 20, 
    backgroundColor: 'white' 
  },
  image: { 
    width: '100%', 
    height: 300, 
    borderRadius: 10 
  },
  label: { 
    marginTop: 10, 
    fontSize: 16 
  },
  bold: { 
    fontWeight: 'bold' 
  },
  closeButton: { 
    marginTop: 20, 
    alignSelf: 'center' 
  },
  closeText: { 
    color: 'blue', 
    fontSize: 16 
  },
});

export default PostDetailsModal;