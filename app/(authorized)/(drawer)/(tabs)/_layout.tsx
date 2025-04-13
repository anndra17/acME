import { Tabs } from "expo-router";
import React from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // or your icon library
import { Pressable } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import { TabBarIcon } from "@/../components/navigation/TabBarIcon";
import { Colors } from "@/../constants/Colors";
import { useColorScheme } from "@/../hooks/useColorScheme";

/**
 * TabLayout manages the bottom tab navigation while integrating with a drawer menu.
 * This layout serves as a nested navigation setup where:
 * - The drawer navigation is the parent (defined in the parent layout)
 * - The tab navigation is nested inside the drawer
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected, 
        tabBarInactiveTintColor: theme.tabIconDefault, 
        headerShown: true,
        /**
         * Add hamburger menu button to all tab headers by default
         * This is placed in screenOptions to avoid repetition across screens
         * Each screen can override this by setting headerLeft: () => null
         */
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={24} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="acneCheck"
        options={{
          headerLeft: () => null,
          title: "Skin Snap",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "heart" : "heart-outline"}
              color={color}
            />
          ),
        }}
      />

<Tabs.Screen
        name="explore"
        options={{
          headerLeft: () => null,
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "code-slash" : "code-slash-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}