import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/theme';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hoş Geldiniz</Text>
        <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
        <Text style={styles.userRole}>{user?.role || 'Rol'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Toplam Bağış</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>İhtiyaç Sahibi</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Aktif Yardım</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Bekleyen Görev</Text>
          </Card>
        </View>

        <Card style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Henüz aktivite bulunmuyor</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentActivity: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
