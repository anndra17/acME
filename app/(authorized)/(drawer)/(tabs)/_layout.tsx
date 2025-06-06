import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { Pressable, Modal, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or your icon library
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";

import { TabBarIcon } from "@/../components/navigation/TabBarIcon";
import { CustomTabBar } from "@/../components/navigation/CustomTabBar"; 
import { Colors } from "@/../constants/Colors";
import { useColorScheme } from "@/../hooks/useColorScheme";
import { useSession } from "../../../../context";
import { getPendingFriendRequestsCount, getPendingFriendRequests } from "../../../../lib/firebase-service";

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
  const { userRole, user } = useSession();
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  console.log("Sunt in layout: (authorized)/(drawer)/_layout.tsx");

 

  // Cererile efective pentru modal
  useEffect(() => {
    if (showRequestsModal && user) {
      setLoadingRequests(true);
      getPendingFriendRequests(user.uid)
        .then(reqs => {
          console.log("[Modal] Cereri de prietenie pentru user:", user.uid, reqs);
          setPendingRequests(reqs);
        })
        .finally(() => setLoadingRequests(false));
    }
  }, [showRequestsModal, user]);

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: true,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 16 }}
            >
              <View>
                <Ionicons name="menu" size={24} />
                {pendingCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <View
            style={{
              width: 340,
              borderRadius: 18,
              padding: 22,
              backgroundColor: "#fff",
              maxHeight: "70%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 18, textAlign: "center" }}>
              Noutăți
            </Text>
            {loadingRequests ? (
              <View style={{ alignItems: "center", padding: 24 }}>
                <Text style={{ color: "#888" }}>Se încarcă...</Text>
              </View>
            ) : pendingRequests.length === 0 ? (
              <Text style={{ color: "#888", textAlign: "center" }}>Nu ai cereri de prietenie în așteptare.</Text>
            ) : (
              <View style={{ width: "100%" }}>
                {pendingRequests.map(req => (
                  <View
                    key={req.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 14,
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
                    {/* Butoane Accept/Refuz */}
                    <View style={{ flexDirection: "row", marginLeft: 8 }}>
                      <Pressable
                        onPress={() => {/* TODO: accept logic */}}
                        style={{
                          backgroundColor: "#22c55e",
                          borderRadius: 20,
                          width: 36,
                          height: 36,
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 6,
                        }}
                      >
                        <Ionicons name="checkmark" size={22} color="#fff" />
                      </Pressable>
                      <Pressable
                        onPress={() => {/* TODO: deny logic */}}
                        style={{
                          backgroundColor: "#ef4444",
                          borderRadius: 20,
                          width: 36,
                          height: 36,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="close" size={22} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <Pressable
              onPress={() => setShowRequestsModal(false)}
              style={{ marginTop: 12, alignSelf: "center" }}
            >
              <Text style={{ color: "#3b82f6", fontWeight: "bold", fontSize: 16 }}>Închide</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}