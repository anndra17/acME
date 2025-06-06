import React, { useEffect, useState } from "react";
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/../context";
import { getPendingFriendRequestsCount } from "../../lib/firebase-service";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Colors } from "../../constants/Colors";

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, userRole } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];
  const isFocused = props.state.routeNames[props.state.index] === "friendRequests";
  const iconColor = isFocused ? theme.tabIconSelected : theme.tabIconDefault;



  useEffect(() => {
    if (user && (userRole === "user" || userRole === "moderator")) {
      getPendingFriendRequestsCount(user.uid).then(setPendingCount);
    }
  }, [user, userRole]);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      {(userRole === "user" || userRole === "moderator") && (
        <DrawerItem
          label={({ color }) => (
            <Text style={{ color: iconColor, fontSize: 14, fontWeight: "500" }}>
            Friend Requests
            </Text>
        )}
          icon={({ size = 24 }) => (
            <View style={{ width: size, alignItems: "center" }}>
            <Ionicons
                name={isFocused ? "person-add" : "person-add-outline"}
                size={size}
                color={iconColor}
            />
              {pendingCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -10,
                    backgroundColor: "#e11d48",
                    borderRadius: 10,
                    minWidth: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 3,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                    {pendingCount}
                  </Text>
                </View>
              )}
            </View>
          )}
          style={{
            backgroundColor:
            props.state.routeNames[props.state.index] === "friendRequests"
                ? theme.tabIconSelected + "22" // cu transparență RGBA hex (22 ~ 13%)
                : "transparent",    
        }}
          focused={isFocused}
          onPress={() => props.navigation.navigate("friendRequests")}
        />
      )}
    </DrawerContentScrollView>
  );
}