// components/LoadingIndicator.tsx
import { View, Text, ActivityIndicator } from "react-native";

export default function LoadingIndicator({ text = "Loading..." }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#888" />
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#888', marginTop: 8 }}>{text}</Text>
    </View>
  );
}