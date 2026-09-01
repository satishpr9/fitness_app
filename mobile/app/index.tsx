import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isOnboardingCompleted, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (!isOnboardingCompleted) {
        router.replace('/(onboarding)/step1-personal');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, isOnboardingCompleted]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
