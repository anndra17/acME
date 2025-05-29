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
      
      {/* Base user screens - visible to all authenticated users */}
      <Tabs.Screen
        name="index"
        options={{
          title:  "My Friends",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
            />
          ),
        }}
        redirect={!['user', 'doctor', 'moderator'].includes(userRole || '')}
      />

      <Tabs.Screen
        name="acneCheck"
        options={{
          title: userRole === 'doctor' ? "Patient Analysis" : "Skin Snap",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "camera" : "camera-outline"}
              color={color}
            />
          ),
        }}
        redirect={!['user', 'doctor', 'moderator'].includes(userRole || '')}
      />
      
      <Tabs.Screen
        name="myJourney"
        options={{
          title: "My Journey ",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "trending-up" : "trending-up-outline"}
              color={color}
            />
          ),
        }}
        redirect={!['user', 'doctor', 'moderator'].includes(userRole || '')}
      />

      
      {/* Admin-only tabs */}
      <Tabs.Screen
        name="admin/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />

      <Tabs.Screen
        name="admin/users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />

      <Tabs.Screen
        name="admin/moderators"
        options={{
          title: "Moderators",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />
      

      <Tabs.Screen
        name="admin/doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "medkit" : "medkit-outline"}
              color={color}
            />
          ),
        }}
        redirect={userRole !== 'admin'}
      />
      
    </Tabs>
     
  );
}