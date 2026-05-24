import { useRouter, useSegments } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

const PUBLIC_SEGMENTS = new Set(['login', 'register']);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isReady, token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const first = segments[0];
    const isPublic = !first || PUBLIC_SEGMENTS.has(first);

    if (!token && !isPublic) {
      router.replace('/login');
    }
  }, [isReady, token, segments, router]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
