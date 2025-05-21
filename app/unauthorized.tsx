import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function Unauthorized() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title]}>Access Denied</Text>
      <Text style={[styles.message]}>
        You don't have permission to access this page.
      </Text>
      <Link href="/login/sign-in" style={[styles.link, { color: theme.primary }]}>
        Return to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 