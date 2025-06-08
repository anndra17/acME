import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors } from '../../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import {
  getAllUsers,
  removeModeratorRole,
  AppUser,
  getBlogPostsCountByUser,
} from '../../../../../lib/firebase-service';
import { Ionicons } from '@expo/vector-icons';
import { PromoteUserModal } from '../../../../../components/admin/PromoteUserModal';

export default function ModeratorsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [blogPostsCounts, setBlogPostsCounts] = useState<{ [userId: string]: number }>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch blogPosts count for each moderator
    const fetchCounts = async () => {
      const counts: { [userId: string]: number } = {};
      const moderators = users.filter(user => user.userRoles?.includes('moderator'));
      await Promise.all(
        moderators.map(async (user) => {
          counts[user.id] = await getBlogPostsCountByUser(user.id);
        })
      );
      setBlogPostsCounts(counts);
    };
    if (users.length) fetchCounts();
  }, [users]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Could not load user list.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to remove the moderator role?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeModeratorRole(userId);
              fetchUsers();
              Alert.alert('Success', 'Moderator role has been removed!');
            } catch (err) {
              Alert.alert('Error', 'Could not remove moderator role.');
              console.error('Error removing moderator:', err);
            }
          },
        },
      ]
    );
  };

  const moderatorsCount = users.filter(user => user.userRoles?.includes('moderator')).length;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.statsContent}>
            <Ionicons name="people" size={32} color={theme.primary} />
            <View style={styles.statsTextContainer}>
              <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>
                {moderatorsCount}
              </Text>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Active moderators
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.usersList}>
        {users
          .filter(user => user.userRoles?.includes('moderator'))
          .map((user) => (
            <View
              key={user.id}
              style={[
                styles.userCard, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.tabIconDefault,
                }
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 12,
                      backgroundColor: "#eee",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 12,
                      backgroundColor: "#FFD600",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 18, color: "#fff" }}>
                      {user.username?.[0]?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>
                    {user.username}
                  </Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                    {user.email}
                  </Text>
                  <Text style={[styles.userPostsCount, { color: theme.textSecondary }]}>
                    {blogPostsCounts[user.id] || 0} Blog Posts
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveModerator(user.id)}
                style={styles.removeButton}
              >
                <Ionicons name="remove-circle-outline" size={24} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>

      <PromoteUserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchUsers}
        roleType="moderator"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTextContainer: {
    marginLeft: 15,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 5,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '98%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userPostsCount: {
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
});
