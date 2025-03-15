import Ionicons from "@expo/vector-icons/Ionicons";
import { Slot } from "expo-router";
import { StyleSheet, Image, Text, View } from "react-native";
import { Colors} from "../../../../constants/Colors";


export default function TabTwoScreen() {
  return (
    <View style={{ flex: 1 , backgroundColor: Colors.light.background }}>
      <Text>EXPLORE SCREEN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});