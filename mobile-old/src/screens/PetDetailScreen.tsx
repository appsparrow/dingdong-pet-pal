import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PetDetailScreen({ route }: any) {
  const { petId } = route.params ?? {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Detail</Text>
      <Text>Pet ID: {petId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
});


