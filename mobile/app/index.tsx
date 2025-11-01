import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return isAuthenticated ? (
    <Redirect href="/(tabs)/dashboard" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
