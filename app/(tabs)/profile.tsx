import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import SimpleProfileForm from '../../components/SimpleProfileForm';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <SimpleProfileForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 