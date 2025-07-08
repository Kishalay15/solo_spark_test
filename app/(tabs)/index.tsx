import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { Link } from 'expo-router';
import FirebaseTest from '../../components/FirebaseTest';
import QuestForm from '../../components/QuestForm';
import QuestResponseForm from '../../components/QuestResponseForm';

export default function HomeScreen() {
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [showQuestResponseForm, setShowQuestResponseForm] = useState(false);
  const [showFirebaseTest, setShowFirebaseTest] = useState(false);

  useEffect(() => {
    try {
      const app = getApp();
      console.log('✅ Firebase Initialized:', app.name);
    } catch (error) {
      console.log('❌ Firebase not initialized');
    }
  }, []);

  if (showQuestForm) {
    return <QuestForm onBack={() => setShowQuestForm(false)} />;
  }

  if (showQuestResponseForm) {
    return <QuestResponseForm onBack={() => setShowQuestResponseForm(false)} />;
  }

  if (showFirebaseTest) {
    return <FirebaseTest />;
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Welcome to Your App!</Text>
      <Text style={styles.subtitle}>Firebase Integration Ready</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.questButton]} 
          onPress={() => setShowQuestForm(true)}
        >
          <Text style={styles.buttonText}>Create New Quest</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.responseButton]} 
          onPress={() => setShowQuestResponseForm(true)}
        >
          <Text style={styles.buttonText}>Answer a Quest</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={() => setShowFirebaseTest(true)}
        >
          <Text style={styles.buttonText}>Firebase Test</Text>
        </TouchableOpacity> */}

        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to Profile Form</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Available Features:</Text>
        <Text style={styles.info}>• Create New Quest - Add quests to solo_spark_quest collection</Text>
        <Text style={styles.info}>• Answer a Quest - Select from existing quests and provide responses</Text>
        <Text style={styles.info}>• Profile Form - Manage user profiles in solo_spark_user collection</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 30,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  questButton: {
    backgroundColor: '#34C759',
  },
  responseButton: {
    backgroundColor: '#FF6B35',
  },
  testButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
});
