import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { getUserNotifications, getUsernameById, getPostById } from "../../../lib/firebase-service";
import { useSession } from "../../../context/index"; // sau de unde iei userul curent
import { formatDistanceToNow } from "date-fns";
import Ionicons from "react-native-vector-icons/Ionicons";
import PostDetailsModal from "../../../components/PostDetailModal";
import { Post } from "../../../types/Post";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../lib/firebase-config"; // adaptează calea
import { useRouter } from "expo-router";

// Definește tipul notificării
type AcmeNotification = {
  id: string;
  type: string;
  fromUserId: string;
  postId: string;
  createdAt: any;
  read: boolean;
  text?: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [notifications, setNotifications] = useState<AcmeNotification[]>([]);
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalPosts, setModalPosts] = useState<Post[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchNotifications = async () => {
      setLoading(true);
      const notifs = await getUserNotifications(user.uid);

      // Extrage userId-urile unice
      const userIds = Array.from(new Set(notifs.map(n => n.fromUserId).filter(Boolean)));

      // Fetch username pentru fiecare userId
      const usernamesMap: { [userId: string]: string } = {};
      await Promise.all(userIds.map(async (uid) => {
        const username = await getUsernameById(uid);
        if (username) usernamesMap[uid] = username;
      }));

      setUsernames(usernamesMap);
      setNotifications(notifs);
      setLoading(false);
    };
    fetchNotifications();
  }, [user?.uid]);

  const handleOpenPost = async (postId: string) => {
    const post = await getPostById(postId);
    if (post) {
      setModalPosts([post]);
      setModalIndex(0);
      setShowPostModal(true);
    }
  };

  const handleNotificationPress = async (notif: AcmeNotification) => {
    // Marchează ca citită în Firestore
    if (!user?.uid || !notif.id) return;
    await updateDoc(
      doc(firestore, `users/${user.uid}/notifications/${notif.id}`),
      { read: true }
    );
    // Deschide postarea/modalul etc.
    handleOpenPost(notif.postId);
    // Opțional: actualizează local lista de notificări
    setNotifications((prev) =>
      prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (unreadNotifications.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="notifications-off-outline" size={48} color="#bbb" style={{ marginBottom: 12 }} />
        <Text style={{ color: "#888", fontSize: 18, textAlign: "center" }}>
          You have no new notifications.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#eee",
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 18,
            marginTop: 24,
          }}
          onPress={() => {
            router.push({ pathname: "/(authorized)/(drawer)/(tabs)/myJourney", params: { refresh: Date.now() } });
          }}
        >
          <Ionicons name="arrow-back" size={18} color="#333" style={{ marginRight: 6 }} />
          <Text style={{ fontWeight: "bold", color: "#333" }}>Back to My Journey</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Adaugă butonul sus în UI:
  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", padding: 12 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#eee",
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 18,
            marginBottom: 4,
          }}
          onPress={() => {
            // Navighează către MyJourney și forțează refresh
            router.push({ pathname: "/(authorized)/(drawer)/(tabs)/myJourney", params: { refresh: Date.now() } });
          }}
        >
          <Ionicons name="arrow-back" size={18} color="#333" style={{ marginRight: 6 }} />
          <Text style={{ fontWeight: "bold", color: "#333" }}>Back to My Journey</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={unreadNotifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.8}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: item.read ? "#fff" : "#f9f9ff",
                borderRadius: 16,
                marginVertical: 6,
                marginHorizontal: 12,
                padding: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>{usernames[item.fromUserId] || "Someone"}</Text>
                  {item.type === "like" && " liked your post"}
                  {item.type === "comment" && ` commented: `}
                  {item.type === "comment" && <Text style={{ fontStyle: "italic" }}>{item.text}</Text>}
                </Text>
                <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                  {item.createdAt?.toDate
                    ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })
                    : ""}
                </Text>
              </View>
              {item.type === "like" && (
                <Ionicons name="heart" size={22} color="#e74c3c" style={{ marginLeft: 8 }} />
              )}
              {item.type === "comment" && (
                <Ionicons name="chatbubble" size={22} color="#3498db" style={{ marginLeft: 8 }} />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      <PostDetailsModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        posts={modalPosts}
        initialIndex={modalIndex}
      />
    </>
  );
}