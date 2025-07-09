import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import seedFirebase from '../services/seedFirebase';

const IndexScreen = () => {
  const handleSeedFirebase = async () => {
    try {
      await seedFirebase();
      Alert.alert('Success', 'Firebase seeding completed!');
    } catch (error) {
      console.error('Error seeding Firebase:', error);
      Alert.alert('Error', 'Failed to seed Firebase. Check console for details.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Seeding</Text>
      <Button title="Seed Firebase" onPress={handleSeedFirebase} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default IndexScreen;
