import { Tabs } from "expo-router";
import React from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // or your icon library
import { Pressable } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import { TabBarIcon } from "@/../components/navigation/TabBarIcon";
import { CustomTabBar } from "@/../components/navigation/CustomTabBar"; 
import { Colors } from "@/../constants/Colors";
import { useColorScheme } from "@/../hooks/useColorScheme";
import { useSession } from "../../../../context";

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
  const { userRole } = useSession();


  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
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
        name="myJourney"
        options={{
          title: "My Journey ",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "code-slash-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'user'}
      />

      <Tabs.Screen
        name="acneCheck"
        options={{
          title: "Skin Snap",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "heart" : "heart-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'user'}
      />
      
      <Tabs.Screen
        name="index"
        options={{
          title: "My Friends",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'user'}
      />

      <Tabs.Screen
        name="admin/index"
        options={{
          title: "index",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "code-slash-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />

      <Tabs.Screen
        name="admin/users"
        options={{
          title: "users",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "heart" : "heart-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />
      


      <Tabs.Screen
        name="admin/settings"
        options={{
          title: "My Admin",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />
      
    </Tabs>
     
  );
}