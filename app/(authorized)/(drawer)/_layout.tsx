import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Colors } from "../../../constants/Colors";
import { useColorScheme } from "react-native";
import { useSession } from "@/../context";
import { Ionicons } from "@expo/vector-icons";

/**
 * DrawerLayout implements the root drawer navigation for the app.
 * This layout wraps the tab navigation and other screens accessible via the drawer menu.
 */
const DrawerLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];
  const { userRole } = useSession();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 
          Used for setting global options for all the screens 
        */}
      <Drawer
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.background,
          },
          drawerActiveTintColor: theme.tabIconSelected, // Culoare pentru elementul activ
          drawerInactiveTintColor: theme.tabIconDefault, // Culoare pentru elementele inactive
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.textPrimary,
        }}
      >
        {/* 
          (tabs) route contains the TabLayout with bottom navigation
          - Nested inside the drawer as the main content
          - headerShown: false removes double headers (drawer + tabs)
        */}

        {/* Main tabs - visible to all users */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
            headerShown: false,
            drawerIcon: ({size, color}) => (
              <Ionicons name="home-outline" size={size} color={color} />
            )
          }}
          redirect={userRole === null}
        />
        {/* 
          Additional drawer routes can be added here
          - Each represents a screen accessible via the drawer menu
          - Will use the drawer header by default
        */}
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "Profile",
            title: "Profile",
          }}
          redirect={userRole === null}
        />

        {/* Admin specific screens */}
        <Drawer.Screen
          name="admin/index"
          options={{
            drawerLabel: "Admin Dashboard",
            title: "Admin Dashboard",
          }}
          redirect={userRole !== 'admin'}
        />
        
        <Drawer.Screen
          name="admin/users"
          options={{
            drawerLabel: "User Management",
            title: "User Management",
          }}
          redirect={userRole !== 'admin'}
        />
        
        <Drawer.Screen
          name="admin/settings"
          options={{
            drawerLabel: "Admin Settings",
            title: "Admin Settings",
          }}
          redirect={userRole !== 'admin'}
        />

        {/* Moderator specific screens */}
        {(userRole === 'moderator' || userRole === 'admin') && (
            <>
            <Drawer.Screen
              name="moderator/blog-posts"
              options={{
                drawerLabel: "Blog Posts",
                title: "Blog Posts",
              }}
              redirect={userRole !== 'moderator'}
            />
          
          <Drawer.Screen
            name="moderator/blog-editor"
            options={{
              drawerLabel: "Content editor",
              title: "Content Reports",
            }}
            redirect={userRole !== 'moderator'}
          />
          </>
         )}


         {/* Doctor-specific drawer items */}
        {(userRole === 'doctor' ) && (
          <>
            <Drawer.Screen
              name="doctor/patient-management"
              options={{
                drawerLabel: "Patient Management",
                title: "Patient Management",
                drawerIcon: ({size, color}) => (
                  <Ionicons name="medical-outline" size={size} color={color} />
                )
              }}
            />
            <Drawer.Screen
              name="doctor/analysis-history"
              options={{
                drawerLabel: "Analysis History",
                title: "Analysis History",
                drawerIcon: ({size, color}) => (
                  <Ionicons name="time-outline" size={size} color={color} />
                )
              }}
            />
          </>
        )}
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;