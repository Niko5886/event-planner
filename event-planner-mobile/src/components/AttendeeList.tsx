import { StyleSheet, Text, View } from 'react-native';

import { EventAttendee } from '@/lib/api';

export function AttendeeList({ attendees }: { attendees: EventAttendee[] }) {
  if (attendees.length === 0) {
    return <Text style={styles.empty}>No attendees yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {attendees.map((a) => (
        <View key={a.userId} style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {a.name}
          </Text>
          {a.extraSlots > 0 ? (
            <Text style={styles.extras}>+{a.extraSlots}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  name: { flex: 1, fontSize: 14, color: '#111827' },
  extras: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  empty: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
});
