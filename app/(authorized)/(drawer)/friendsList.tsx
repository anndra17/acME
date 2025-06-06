import { View, Text, FlatList, Image, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { getFriendsList } from "../../../lib/firebase-service";
import { getAuth } from "@firebase/auth";

export default function FriendsListScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      const userId = getAuth().currentUser?.uid;
      if (userId) {
        const data = await getFriendsList(userId);
        setFriends(data);
      }
      setLoading(false);
    };
    fetchFriends();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <Text style={{ fontWeight: "bold", fontSize: 22, marginBottom: 16 }}>Prieteni</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <Image
                source={{ uri: item.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || "Anonim")}` }}
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: "#eee" }}
              />
              <Text style={{ fontSize: 16 }}>{item.username || item.email}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}