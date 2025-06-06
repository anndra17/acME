import { Tabs } from "expo-router";
import React, { useState } from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // or your icon library
import { Pressable, Modal, View, Text } from "react-native";
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
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  // Hardcodat: simulăm că avem 2 cereri de prietenie
  const pendingCount = 2;

  console.log("Sunt in layout: (authorized)/(drawer)/_layout.tsx");

  return (
    <>
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
          // Adaugă iconița de notificări în dreapta
          headerRight: () => (
            <Pressable
              onPress={() => setShowRequestsModal(true)}
              style={{ marginRight: 16 }}
            >
              <View>
                <Ionicons name="notifications-outline" size={24} />
                {pendingCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      backgroundColor: "#e11d48",
                      borderRadius: 10,
                      minWidth: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 4,
                      borderWidth: 2,
                      borderColor: "#fff",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                      {pendingCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          ),
        }}
      >
        
        {/* Base user screens - visible to all authenticated users */}
        <Tabs.Screen
          name="index"
          options={{
            title:  "Stay informed",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "information" : "information-outline"}
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

        <Tabs.Screen
          name="friends"
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

      {/* Modal pentru cereri de prietenie */}
      <Modal
        visible={showRequestsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestsModal(false)}
      >
        <Pressable style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.18)",
          justifyContent: "center",
          alignItems: "center"
        }} onPress={() => setShowRequestsModal(false)}>
          <View style={{
            width: 340,
            borderRadius: 18,
            padding: 22,
            backgroundColor: "#fff",
            maxHeight: "70%",
          }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Cererile de prietenie</Text>
            {/* Aici poți adăuga lista cu cererile de prietenie */}
            <Text>Funcționalitatea de afișare a cererilor de prietenie vine aici.</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}