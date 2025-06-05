import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ProfileHeaderProps {
  username: string;
  profileImage?: string;
  loading?: boolean;
  onEdit?: () => void;
  reviewedCount: number;
  totalCount: number;
}

export default function ProfileHeader({
  username,
  profileImage,
  loading = false,
  onEdit,
  reviewedCount,
  totalCount,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statLabel}>My Community</Text>
        </View>

        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={onEdit}>
            {loading && <ActivityIndicator size="small" color="#999" style={StyleSheet.absoluteFill} />}
            {profileImage && <Image source={{ uri: profileImage }} style={styles.profilePic} />}
            <View style={styles.editIcon}>
              <FontAwesome name="pencil" size={10} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reviewedCount}/{totalCount}</Text>
          <Text style={styles.statLabel}>Reviewed Posts</Text>
        </View>
      </View>
      <Text style={styles.username}>@{username}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  profilePicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginHorizontal: 16,
    position: 'relative',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  editIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  username: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});