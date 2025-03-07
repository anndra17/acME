import { Text, View, StyleSheet, Button } from 'react-native'; // Import Button

export default function ProfileScreen() { // Corrected component name


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile screen</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});