import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Event Planner</Text>
        <Text style={styles.tagline}>Plan events. Invite friends. Never miss a match.</Text>
      </View>

      <View style={styles.actions}>
        <Link href="/login" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
        </Link>

        <Link href="/register" style={styles.secondaryLink}>
          Create Account
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  actions: {
    gap: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 240,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryLink: {
    fontSize: 15,
    color: '#208AEF',
    fontWeight: '500',
    paddingVertical: 8,
  },
});
