import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../../context";
import { getPendingFriendRequests, acceptFriendRequest, denyFriendRequest } from "../../../lib/firebase-service";

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

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 18, backgroundColor: "#fff", minHeight: "100%" }}>
      <Text style={{
        fontWeight: "bold",
        fontSize: 26,
        marginBottom: 22,
        color: "#222",
        letterSpacing: 0.2,
        textAlign: "center"
      }}>
        Friend Requests
      </Text>
      {loading ? (
        <Text style={{ color: "#888", textAlign: "center" }}>Se încarcă...</Text>
      ) : pendingRequests.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Ionicons name="mail-open-outline" size={48} color="#cbd5e1" style={{ marginBottom: 10 }} />
          <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
                You have no pending friend requests.          
          </Text>
        </View>
      ) : (
        pendingRequests.map(req => (
          <View
            key={req.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
              backgroundColor: "#f8fafc",
              borderRadius: 16,
              padding: 14,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            {req.fromUserProfileImage ? (
              <Image
                source={{ uri: req.fromUserProfileImage }}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  marginRight: 14,
                  borderWidth: 2,
                  borderColor: "#e5e7eb",
                  backgroundColor: "#e5e7eb",
                }}
              />
            ) : (
              <Ionicons
                name="person-circle"
                size={54}
                color="#64748b"
                style={{ marginRight: 14 }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontWeight: "bold",
                fontSize: 16,
                color: "#222"
              }}>
                {req.fromUserUsername || req.fromUserName || "Utilizator"}
              </Text>
              <Text style={{ color: "#64748b", fontSize: 13 }}>
                {req.fromUserEmail}
              </Text>
              {req.message ? (
                <Text style={{
                  color: "#334155",
                  fontStyle: "italic",
                  marginTop: 4,
                  backgroundColor: "#e0e7ef",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  fontSize: 14,
                }}>
                  „{req.message}”
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", marginLeft: 10 }}>
              <Pressable
                onPress={async () => {
                  if (!user) console.error("User not found");
                  await acceptFriendRequest(req.id, req.fromUserId, user.uid);
                  // Refă lista după accept
                  setLoading(true);
                  getPendingFriendRequests(user.uid)
                    .then(setPendingRequests)
                    .finally(() => setLoading(false));
                }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#16a34a" : "#22c55e",
                  borderRadius: 22,
                  width: 38,
                  height: 38,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 6,
                  shadowColor: "#22c55e",
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 2,
                })}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </Pressable>
              <Pressable
                onPress={async () => {
                  await denyFriendRequest(req.id);
                  // Refă lista după deny
                  setLoading(true);
                  getPendingFriendRequests(user.uid)
                    .then(setPendingRequests)
                    .finally(() => setLoading(false));
                }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#b91c1c" : "#ef4444",
                  borderRadius: 22,
                  width: 38,
                  height: 38,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#ef4444",
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 2,
                })}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}