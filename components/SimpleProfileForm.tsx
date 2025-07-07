import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import firebaseService from '../services/firebaseService';

const SimpleProfileForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [moodFrequency, setMoodFrequency] = useState('');
  const [emotionalNeeds, setEmotionalNeeds] = useState('');
  const [compatibilityScore, setCompatibilityScore] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState('light');

  // Personality Traits state
  const [openness, setOpenness] = useState('');
  const [neuroticism, setNeuroticism] = useState('');
  const [agreeableness, setAgreeableness] = useState('');

  // Mood History state
  const [moodEntry, setMoodEntry] = useState('');
  const [moodNotes, setMoodNotes] = useState('');

  // Points Transaction state
  const [points, setPoints] = useState('');
  const [transactionType, setTransactionType] = useState('earned');
  const [transactionReason, setTransactionReason] = useState('');

  const saveUserProfile = async () => {
    try {
      const userData = {
        email,
        displayName,
        emotionalProfile: {
          currentMood,
          moodFrequency,
          emotionalNeeds,
        },
        compatibilityScore: parseInt(compatibilityScore) || 0,
        pointsProfile: {
          totalPoints: parseInt(totalPoints) || 0,
          level,
        },
        userSettings: {
          notificationsEnabled,
          theme,
        },
      };

      await firebaseService.saveUserProfile(userData);
      Alert.alert('Success', 'User profile saved to Firebase successfully!');
      console.log('User Profile Data saved to Firebase:', userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save user profile to Firebase');
      console.error('Error saving user profile:', error);
    }
  };

  const savePersonalityTrait = async () => {
    try {
      const traitData = {
        openness: parseInt(openness) || 5,
        neuroticism: parseInt(neuroticism) || 5,
        agreeableness: parseInt(agreeableness) || 5,
      };

      await firebaseService.savePersonalityTrait(traitData);
      Alert.alert('Success', 'Personality trait saved to Firebase successfully!');
      console.log('Personality trait saved to Firebase:', traitData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save personality trait to Firebase');
      console.error('Error saving personality trait:', error);
    }
  };

  const saveMoodEntry = async () => {
    try {
      const moodData = {
        mood: moodEntry,
        notes: moodNotes,
      };

      await firebaseService.saveMoodEntry(moodData);
      Alert.alert('Success', 'Mood entry saved to Firebase successfully!');
      console.log('Mood entry saved to Firebase:', moodData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry to Firebase');
      console.error('Error saving mood entry:', error);
    }
  };

  const savePointsTransaction = async () => {
    try {
      const transactionData = {
        points: parseInt(points) || 0,
        type: transactionType as 'earned' | 'spent',
        reason: transactionReason,
      };

      await firebaseService.savePointsTransaction(transactionData);
      Alert.alert('Success', 'Points transaction saved to Firebase successfully!');
      console.log('Points transaction saved to Firebase:', transactionData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save points transaction to Firebase');
      console.error('Error saving points transaction:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Profile Form</Text>

      {/* User Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text style={styles.subsectionTitle}>Emotional Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Current Mood"
          value={currentMood}
          onChangeText={setCurrentMood}
        />

        <TextInput
          style={styles.input}
          placeholder="Mood Frequency"
          value={moodFrequency}
          onChangeText={setMoodFrequency}
        />

        <TextInput
          style={styles.input}
          placeholder="Emotional Needs"
          value={emotionalNeeds}
          onChangeText={setEmotionalNeeds}
        />

        <TextInput
          style={styles.input}
          placeholder="Compatibility Score (0-100)"
          value={compatibilityScore}
          onChangeText={setCompatibilityScore}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Total Points"
          value={totalPoints}
          onChangeText={setTotalPoints}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Level"
          value={level}
          onChangeText={setLevel}
        />

        <View style={styles.switchContainer}>
          <Text>Notifications Enabled</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Theme (light/dark)"
          value={theme}
          onChangeText={setTheme}
        />

        <TouchableOpacity style={styles.button} onPress={saveUserProfile}>
          <Text style={styles.buttonText}>Save User Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality Traits</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Openness Score (1-10)"
          value={openness}
          onChangeText={setOpenness}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Neuroticism Score (1-10)"
          value={neuroticism}
          onChangeText={setNeuroticism}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Agreeableness Score (1-10)"
          value={agreeableness}
          onChangeText={setAgreeableness}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={savePersonalityTrait}>
          <Text style={styles.buttonText}>Save Personality Trait</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood History</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Current Mood"
          value={moodEntry}
          onChangeText={setMoodEntry}
        />

        <TextInput
          style={styles.input}
          placeholder="Notes about your mood"
          value={moodNotes}
          onChangeText={setMoodNotes}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.button} onPress={saveMoodEntry}>
          <Text style={styles.buttonText}>Save Mood Entry</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Points Transactions</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Points"
          value={points}
          onChangeText={setPoints}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Transaction Type (earned/spent)"
          value={transactionType}
          onChangeText={setTransactionType}
        />

        <TextInput
          style={styles.input}
          placeholder="Reason for transaction"
          value={transactionReason}
          onChangeText={setTransactionReason}
        />

        <TouchableOpacity style={styles.button} onPress={savePointsTransaction}>
          <Text style={styles.buttonText}>Save Points Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimpleProfileForm; 