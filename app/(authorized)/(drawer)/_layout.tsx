import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Colors } from "../../../constants/Colors";
import { useColorScheme } from "react-native";

/**
 * DrawerLayout implements the root drawer navigation for the app.
 * This layout wraps the tab navigation and other screens accessible via the drawer menu.
 */
const DrawerLayout = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

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
            drawerInactiveTintColor: theme.tint, // Culoare pentru elementele inactive
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
        {/* options - Used for setting the individual screen options for each drawer individually */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
            headerShown: false,
          }}
        />
        {/* 
          Additional drawer routes can be added here
          - Each represents a screen accessible via the drawer menu
          - Will use the drawer header by default
        */}
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "Profile", // Label shown in drawer menu
            title: "Profile", // Header title when screen is open
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;