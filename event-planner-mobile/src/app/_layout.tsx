import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Event Planner' }} />
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
      <Stack.Screen name="event-details" options={{ title: 'Event Details' }} />
    </Stack>
  );
}
