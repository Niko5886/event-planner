import { StyleSheet, Text, View } from 'react-native';

import { EventComment } from '@/lib/api';

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const date = d.toISOString().slice(0, 10);
    const time = d.toISOString().slice(11, 16);
    return `${date} ${time}`;
  } catch {
    return iso;
  }
}

export function CommentList({ comments }: { comments: EventComment[] }) {
  if (comments.length === 0) {
    return <Text style={styles.empty}>No comments yet. Be the first!</Text>;
  }

  return (
    <View style={styles.list}>
      {comments.map((c) => (
        <View key={c.id} style={styles.item}>
          <View style={styles.header}>
            <Text style={styles.author}>{c.author.name}</Text>
            <Text style={styles.time}>{formatTimestamp(c.createdAt)}</Text>
          </View>
          <Text style={styles.text}>{c.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  author: { fontSize: 14, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF' },
  text: { fontSize: 14, color: '#1F2937', lineHeight: 20 },
  empty: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
});
