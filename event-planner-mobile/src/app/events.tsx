import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function EventsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.text}>Events</Text>
      </View>

      <View style={styles.footer}>
        <Button title="Logout" variant="secondary" onPress={onLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
  footer: { paddingBottom: 16 },
});
