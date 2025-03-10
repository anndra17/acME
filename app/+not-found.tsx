// app/+not-found.tsx
import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>This screen doesn't exist.</Text>
            <Link href="/">Go to home</Link>
        </View>
    );
}