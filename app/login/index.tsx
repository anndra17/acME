import Uuid from "expo-modules-core/src/uuid";
import {ReactNode} from "react";
import {Button, Text, View, StyleSheet} from "react-native";
import 'react-native-gesture-handler';
import { Colors} from "../../constants/Colors";



export default function LoginScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login Screen</Text>
      <Button title="Sign in with Google"/>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 20, // Increased font size
      marginBottom: 20, // Added margin
    },
  });