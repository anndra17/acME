import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { getAdminStats, AdminStats } from '../../../../../lib/firebase-service';
import { Ionicons } from '@expo/vector-icons';
import { collection, getCountFromServer } from "firebase/firestore";
import { firestore } from "../../../../../lib/firebase-config"; // adaptează calea

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminStats = await getAdminStats();

        // Fetch blogPosts count
        const blogPostsSnap = await getCountFromServer(collection(firestore, "blogPosts"));
        const totalBlogPosts = blogPostsSnap.data().count;

        setStats({
          ...adminStats,
          totalForums: totalBlogPosts, // suprascrie cu numărul real din blogPosts
        });
        setError(null);
      } catch (err) {
        setError('Could not load statistics. Please try again.');
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textPrimary }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Hi, Admin🧑‍✈️</Text>
      
      <View style={styles.statsContainer}>
        <StatCard
          title="Users"
          value={stats?.totalUsers || 0}
          icon="people"
          theme={theme}
        />
       
        <StatCard
          title="Doctors"
          value={stats?.totalDoctors || 0}
          icon="medical"
          theme={theme}
        />
        <StatCard
          title="Moderators"
          value={stats?.totalModerators || 0}
          icon="shield-checkmark"
          theme={theme}
        />
        <StatCard
          title="Forums"
          value={stats?.totalForums || 0}
          icon="chatbubbles"
          theme={theme}
        />
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
}

function StatCard({ title, value, icon, theme }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <Ionicons name={icon} size={32} color={theme.primary} />
      <Text style={[styles.cardValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'semibold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
    width: '47%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
