import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getUserNotifications, getUsernameById } from "../../../lib/firebase-service";
import { useSession } from "../../../context/index"; // sau de unde iei userul curent
import { formatDistanceToNow } from "date-fns";
import Ionicons from "react-native-vector-icons/Ionicons";

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
  const { user } = useSession();
  const [notifications, setNotifications] = useState<AcmeNotification[]>([]);
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No notifications.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
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
      )}
    />
  );
}