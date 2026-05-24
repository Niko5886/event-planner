import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AttendeeList } from '@/components/AttendeeList';
import { Button } from '@/components/Button';
import { CommentList } from '@/components/CommentList';
import { ErrorBanner } from '@/components/ErrorBanner';
import {
  ApiError,
  EventDetails,
  getEventRequest,
  leaveEventRequest,
  postCommentRequest,
  rsvpEventRequest,
  setExtraSlotsRequest,
} from '@/lib/api';

const MIN_EXTRA_SLOTS = 0;

const STATE_LABEL: Record<string, string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  past: 'Past',
};

const STATE_COLOR: Record<string, { bg: string; fg: string }> = {
  upcoming: { bg: '#DBEAFE', fg: '#1E40AF' },
  ongoing: { bg: '#DCFCE7', fg: '#166534' },
  past: { bg: '#E5E7EB', fg: '#374151' },
};

function formatDateTime(date: string, time: string) {
  const [hh, mm] = time.split(':');
  return `${date} • ${hh}:${mm}`;
}

export default function EventDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const maxExtraSlots = event
    ? Math.max(0, event.capacity - event.attendeesCount + event.userExtraSlots)
    : 0;

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!Number.isInteger(eventId) || eventId <= 0) {
        setError('Invalid event id.');
        setLoading(false);
        return;
      }

      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await getEventRequest(eventId);
        setEvent(data);
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('Failed to load event.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await fn();
      const fresh = await getEventRequest(eventId);
      setEvent(fresh);
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const onRsvp = () => runAction(() => rsvpEventRequest(eventId));
  const onLeave = () => runAction(() => leaveEventRequest(eventId));
  const onChangeSlots = (delta: number) => {
    if (!event) return;
    const next = event.userExtraSlots + delta;
    if (next < MIN_EXTRA_SLOTS || next > maxExtraSlots) return;
    runAction(() => setExtraSlotsRequest(eventId, next));
  };

  const onPostComment = async () => {
    if (!event) return;
    const text = newComment.trim();
    if (!text) return;

    setActionError(null);
    setPostingComment(true);
    try {
      const created = await postCommentRequest(eventId, text);
      setEvent({ ...event, comments: [...event.comments, created] });
      setNewComment('');
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <ErrorBanner message={error ?? 'Event not found.'} />
      </View>
    );
  }

  const isActive = !event.canceled && (event.state === 'upcoming' || event.state === 'ongoing');
  const stateColor = STATE_COLOR[event.state] ?? STATE_COLOR.upcoming;
  const isFull = event.capacityState === 'full' || event.capacityState === 'over';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={[styles.badge, { backgroundColor: stateColor.bg }]}>
          <Text style={[styles.badgeText, { color: stateColor.fg }]}>
            {event.canceled ? 'Canceled' : STATE_LABEL[event.state] ?? event.state}
          </Text>
        </View>
      </View>
      <Text style={styles.group}>{event.groupTitle}</Text>

      <View style={styles.card}>
        <Row label="When" value={formatDateTime(event.date, event.time)} />
        <Row label="Where" value={event.location} />
        <Row label="Type" value={event.type} />
        <Row
          label="Capacity"
          value={`${event.attendeesCount} / ${event.capacity}`}
          highlight={isFull}
        />
        <Row label="Organizer" value={event.createdBy.name} />
      </View>

      {event.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      ) : null}

      <ErrorBanner message={actionError} />

      {isActive ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Attendance</Text>
          {event.isRsvped ? (
            <View style={styles.rsvpBlock}>
              <Text style={styles.rsvpText}>You&apos;re going! 🎉</Text>

              <View style={styles.slotsRow}>
                <Text style={styles.slotsLabel}>
                  Extra slots for friends (available: {maxExtraSlots})
                </Text>
                <View style={styles.slotsControls}>
                  <Button
                    title="−"
                    variant="secondary"
                    onPress={() => onChangeSlots(-1)}
                    disabled={actionLoading || event.userExtraSlots <= MIN_EXTRA_SLOTS}
                  />
                  <Text style={styles.slotsValue}>{event.userExtraSlots}</Text>
                  <Button
                    title="+"
                    variant="secondary"
                    onPress={() => onChangeSlots(1)}
                    disabled={actionLoading || event.userExtraSlots >= maxExtraSlots}
                  />
                </View>
              </View>

              <Button
                title="Leave Event"
                variant="secondary"
                onPress={onLeave}
                loading={actionLoading}
              />
            </View>
          ) : (
            <Button title="Join" onPress={onRsvp} loading={actionLoading} />
          )}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Attendees ({event.attendeesCount})</Text>
        <AttendeeList attendees={event.attendees} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Comments ({event.comments.length})</Text>
        <CommentList comments={event.comments} />

        <View style={styles.commentForm}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment…"
            placeholderTextColor="#9CA3AF"
            multiline
            editable={!postingComment}
            style={styles.commentInput}
          />
          <Button
            title="Post Comment"
            onPress={onPostComment}
            loading={postingComment}
            disabled={!newComment.trim()}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 16, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: '#111827' },
  group: { fontSize: 14, color: '#6B7280', marginTop: -8 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  description: { fontSize: 14, color: '#1F2937', lineHeight: 20 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 13, color: '#6B7280' },
  rowValue: { flex: 1, fontSize: 14, color: '#111827', textAlign: 'right' },
  rowHighlight: { color: '#B91C1C', fontWeight: '600' },

  rsvpBlock: { gap: 12 },
  rsvpText: { fontSize: 15, color: '#166534', fontWeight: '600' },
  slotsRow: { gap: 8 },
  slotsLabel: { fontSize: 13, color: '#374151' },
  slotsControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotsValue: { fontSize: 18, fontWeight: '700', color: '#111827', minWidth: 24, textAlign: 'center' },

  commentForm: { gap: 8, marginTop: 4 },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    minHeight: 70,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
});
