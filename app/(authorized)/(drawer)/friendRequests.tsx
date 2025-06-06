import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../../context";
import { getPendingFriendRequests } from "../../../lib/firebase-service";

export default function FriendRequestsScreen() {
  const { user } = useSession();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getPendingFriendRequests(user.uid)
      .then(setPendingRequests)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 22, marginBottom: 18 }}>Cereri de prietenie</Text>
      {loading ? (
        <Text>Se încarcă...</Text>
      ) : pendingRequests.length === 0 ? (
        <Text style={{ color: "#888" }}>Nu ai cereri de prietenie în așteptare.</Text>
      ) : (
        pendingRequests.map(req => (
          <View
            key={req.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              backgroundColor: "#f3f4f6",
              borderRadius: 10,
              padding: 10,
            }}
          >
            {req.fromUserProfileImage ? (
              <Image
                source={{ uri: req.fromUserProfileImage }}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
              />
            ) : (
              <Ionicons
                name="person-circle"
                size={36}
                color="#64748b"
                style={{ marginRight: 10 }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>
                {req.fromUserUsername || req.fromUserName || "Utilizator"}
              </Text>
              <Text style={{ color: "#888", fontSize: 13 }}>
                {req.fromUserEmail}
              </Text>
              {req.message ? (
                <Text style={{ color: "#555", fontStyle: "italic", marginTop: 4 }}>
                  „{req.message}”
                </Text>
              ) : null}
            </View>
            {/* Accept/Deny buttons aici */}
          </View>
        ))
      )}
    </ScrollView>
  );
}