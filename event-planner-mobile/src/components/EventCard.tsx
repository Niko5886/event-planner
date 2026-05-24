import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EventListItem } from '@/lib/api';

type Props = {
  event: EventListItem;
  onPress?: () => void;
};

const STATE_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  upcoming: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Upcoming' },
  ongoing: { bg: '#DCFCE7', fg: '#166534', label: 'Ongoing' },
  past: { bg: '#E5E7EB', fg: '#374151', label: 'Past' },
};

function formatDate(date: string, time: string): string {
  const [hh, mm] = time.split(':');
  return `${date} • ${hh}:${mm}`;
}

export function EventCard({ event, onPress }: Props) {
  const stateStyle = STATE_COLORS[event.state] ?? STATE_COLORS.upcoming;
  const isFull = event.attendees >= event.capacity;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: stateStyle.bg }]}>
          <Text style={[styles.badgeText, { color: stateStyle.fg }]}>
            {event.canceled ? 'Canceled' : stateStyle.label}
          </Text>
        </View>
      </View>

      <Text style={styles.group}>{event.groupTitle}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatDate(event.date, event.time)}</Text>
        <Text style={styles.meta}>{event.location}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Type: {event.type}</Text>
        <Text style={[styles.meta, isFull && styles.full]}>
          {event.attendees} / {event.capacity}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardPressed: { opacity: 0.7 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  group: { fontSize: 13, color: '#6B7280' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  meta: { fontSize: 13, color: '#374151' },
  full: { color: '#B91C1C', fontWeight: '600' },
});
