import { StyleSheet, Text, View } from 'react-native';

export default function EventDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Event Details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});
