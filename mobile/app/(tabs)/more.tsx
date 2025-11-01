import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/theme';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route?: string;
  onPress?: () => void;
  color?: string;
};

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumu kapatmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    { icon: 'book', title: 'Burslar', route: '/scholarships' },
    { icon: 'wallet', title: 'Fonlar', route: '/funds' },
    { icon: 'chatbubbles', title: 'Mesajlar', route: '/messages' },
    { icon: 'checkbox', title: 'Görevler', route: '/tasks' },
    { icon: 'calendar', title: 'Toplantılar', route: '/meetings' },
    { icon: 'business', title: 'Partnerler', route: '/partners' },
    { icon: 'people', title: 'Kullanıcılar', route: '/users' },
    { icon: 'settings', title: 'Ayarlar', route: '/settings' },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={item.onPress || (() => {})}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, item.color && { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color={item.color ? '#ffffff' : colors.primary} />
        </View>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={32} color="#ffffff" />
        </View>
        <Text style={styles.profileName}>{user?.name || 'Kullanıcı'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.profileRole}>{user?.role || 'Rol'}</Text>
      </Card>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Modüller</Text>
        <Card style={styles.menuCard}>
          {menuItems.map(renderMenuItem)}
        </Card>
      </View>

      <View style={styles.menuSection}>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.destructive }]}>
                <Ionicons name="log-out" size={24} color="#ffffff" />
              </View>
              <Text style={[styles.menuItemText, { color: colors.destructive }]}>
                Çıkış Yap
              </Text>
            </View>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PORTAL v1.0.0</Text>
        <Text style={styles.footerText}>Dernek Yönetim Sistemi</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  profileRole: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
