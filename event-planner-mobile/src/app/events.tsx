import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EventCard } from '@/components/EventCard';
import { useAuth } from '@/context/AuthContext';
import { ApiError, EventListItem, listEventsRequest } from '@/lib/api';

export default function EventsScreen() {
  const { signOut, token, user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await listEventsRequest(1, 50);
      setEvents(result.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong while loading events.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      load('initial');
    }
  }, [token, load]);

  const onLogout = async () => {
    try {
      await signOut();
    } finally {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to Event Planner</Text>
        {user ? <Text style={styles.hello}>Hello, {user.name}</Text> : null}
      </View>

      <View style={styles.body}>
        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPress={() =>
                  router.push({ pathname: '/event-details', params: { id: String(item.id) } })
                }
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={events.length === 0 ? styles.emptyContent : styles.listContent}
            ListEmptyComponent={
              error ? null : (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>No active events yet.</Text>
                </View>
              )
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} />
            }
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button title="Logout" variant="secondary" onPress={onLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  header: { paddingVertical: 12, gap: 4 },
  welcome: { fontSize: 22, fontWeight: '700', color: '#111827' },
  hello: { fontSize: 15, color: '#4B5563' },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  listContent: { paddingVertical: 8 },
  emptyContent: { flexGrow: 1 },
  separator: { height: 12 },
  emptyText: { fontSize: 15, color: '#6B7280' },
  footer: { paddingTop: 12 },
});
