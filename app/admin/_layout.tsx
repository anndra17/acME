import { useSession } from "@/../context";
import { Redirect, Tabs, Slot } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function AdminLayout() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  // Tab navigation pentru admin
  return (
    <Tabs>
      <Tabs.Screen name="add-doctor" options={{ title: "Add Doctor" }} />
      <Tabs.Screen name="add-moderator" options={{ title: "Add Moderator" }} />
      <Tabs.Screen name="users" options={{ title: "Users" }} />
    </Tabs>
  );
}
