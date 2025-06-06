import { View, Text, FlatList, Image, ActivityIndicator, Dimensions, Alert, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { getFriendsList, getFriendshipDate, deleteFriendship } from "../../../lib/firebase-service";
import { getAuth } from "@firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function FriendsListScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendshipDates, setFriendshipDates] = useState<{ [id: string]: string }>({});
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

  useEffect(() => {
    const fetchFriendshipDates = async () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) return;
      const dates: { [id: string]: string } = {};
      for (const friend of friends) {
        const date = await getFriendshipDate(userId, friend.id);
        dates[friend.id] = date
          ? date.toLocaleDateString("ro-RO")
          : "necunoscut";
      }
      setFriendshipDates(dates);
    };
    if (friends.length) fetchFriendshipDates();
  }, [friends]);

  const handleDeleteFriend = (friendId: string, username: string) => {
    Alert.alert(
      "Confirmare",
      `Sigur vrei să nu mai fii prieten cu ${username}?`,
      [
        { text: "Anulează", style: "cancel" },
        {
          text: "Șterge",
          style: "destructive",
          onPress: async () => {
            const userId = getAuth().currentUser?.uid;
            if (!userId) return;
            try {
              await deleteFriendship(userId, friendId);
              setFriends(prev => prev.filter(f => f.id !== friendId));
            } catch (e) {
              Alert.alert("Eroare", "A apărut o eroare la ștergerea prietenului.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <Text style={{ fontWeight: "bold", fontSize: 22, marginBottom: 16 }}>Prieteni</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                marginBottom: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
                width: screenWidth - 40,
                alignSelf: "center",
              }}
            >
              <Image
                source={{ uri: item.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || "Anonim")}` }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "#e6e6e6",
                  marginRight: 16,
                  backgroundColor: "#eee"
                }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, color: "#222" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.username || item.email}
                </Text>
                <Text
                  style={{ color: "#888", fontSize: 13, marginTop: 2 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Prieteni din {friendshipDates[item.id]}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDeleteFriend(item.id, item.username || item.email)}
                style={{
                  padding: 8,
                  marginLeft: 8,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={22} color="#d11a2a" />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}