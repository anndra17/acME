import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Colors } from "../../constants/Colors";
import {addReviewedFieldToPosts}  from "../../lib/firebase-service"
// Importează funcția ta de fetch users și block user din firebase-service
// import { getAllUsers, blockUser } from "../../lib/firebase-service";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  // Exemplu fetch users (înlocuiește cu funcția ta reală)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // const data = await getAllUsers();
      // setUsers(data);
      setUsers([
        { id: "1", username: "user1", email: "user1@mail.com", role: "user", blocked: false },
        { id: "2", username: "mod1", email: "mod1@mail.com", role: "moderator", blocked: false },
        { id: "3", username: "doctor1", email: "doctor1@mail.com", role: "doctor", blocked: true },
      ]);
      setLoading(false);
    };
    fetchUsers();
    addReviewedFieldToPosts();
    Alert.alert("Info", "Toate postările au fost verificate pentru câmpul 'reviewed'");


  }, []);

  const handleBlock = (userId: string) => {
    Alert.alert("Blocare", "Sigur vrei să blochezi acest user?", [
      { text: "Anulează", style: "cancel" },
      {
        text: "Blochează",
        style: "destructive",
        onPress: () => {
          // await blockUser(userId);
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, blocked: true } : u))
          );
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View>
              <Text style={styles.username}>{item.username} ({item.role})</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.blockButton,
                item.blocked && { backgroundColor: "#ccc" },
              ]}
              disabled={item.blocked}
              onPress={() => handleBlock(item.id)}
            >
              <Text style={{ color: "#fff" }}>
                {item.blocked ? "Blocat" : "Blochează"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.light.background },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: Colors.light.primary },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  username: { fontWeight: "bold", fontSize: 16, color: Colors.light.textPrimary },
  email: { color: Colors.light.textSecondary, fontSize: 14 },
  blockButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
});
