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

interface UserProfile {
  email: string;
  displayName: string;
  emotionalProfile: {
    currentMood: string;
    moodFrequency: string;
    emotionalNeeds: string;
  };
  compatibilityScore: number;
  pointsProfile: {
    totalPoints: number;
    level: string;
  };
  userSettings: {
    notificationsEnabled: boolean;
    theme: string;
  };
}

interface PersonalityTrait {
  openness: number;
  neuroticism: number;
  agreeableness: number;
}

interface MoodEntry {
  mood: string;
  notes: string;
}

interface PointsTransaction {
  points: number;
  type: 'earned' | 'spent';
  reason: string;
}

interface QuestResponse {
  questId: string;
  response: string;
}

const UserProfileForm: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    displayName: '',
    emotionalProfile: {
      currentMood: '',
      moodFrequency: '',
      emotionalNeeds: '',
    },
    compatibilityScore: 0,
    pointsProfile: {
      totalPoints: 0,
      level: 'Beginner',
    },
    userSettings: {
      notificationsEnabled: true,
      theme: 'light',
    },
  });

  const [personalityTrait, setPersonalityTrait] = useState<PersonalityTrait>({
    openness: 5,
    neuroticism: 5,
    agreeableness: 5,
  });

  const [moodEntry, setMoodEntry] = useState<MoodEntry>({
    mood: '',
    notes: '',
  });

  const [pointsTransaction, setPointsTransaction] = useState<PointsTransaction>({
    points: 0,
    type: 'earned',
    reason: '',
  });

  const [questResponse, setQuestResponse] = useState<QuestResponse>({
    questId: '',
    response: '',
  });

  const [quests, setQuests] = useState([
    { id: 'quest1', questionText: 'How do you typically handle stress?', category: 'emotional intelligence', options: ['A. Talk to someone', 'B. Exercise', 'C. Meditate', 'D. Distract myself'], pointValue: 10 },
    { id: 'quest2', questionText: 'What makes you feel most fulfilled?', category: 'personal growth', options: ['A. Helping others', 'B. Achieving goals', 'C. Learning new things', 'D. Spending time with loved ones'], pointValue: 15 },
  ]);

  const saveUserProfile = async () => {
    try {
      await firebaseService.saveUserProfile(userProfile);
      Alert.alert('Success', 'User profile saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save user profile');
      console.error('Error saving user profile:', error);
    }
  };

  const savePersonalityTrait = async () => {
    try {
      await firebaseService.savePersonalityTrait(personalityTrait);
      Alert.alert('Success', 'Personality trait saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save personality trait');
      console.error('Error saving personality trait:', error);
    }
  };

  const saveMoodEntry = async () => {
    try {
      await firebaseService.saveMoodEntry(moodEntry);
      Alert.alert('Success', 'Mood entry saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry');
      console.error('Error saving mood entry:', error);
    }
  };

  const savePointsTransaction = async () => {
    try {
      await firebaseService.savePointsTransaction(pointsTransaction);
      Alert.alert('Success', 'Points transaction saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save points transaction');
      console.error('Error saving points transaction:', error);
    }
  };

  const saveQuestResponse = async () => {
    try {
      await firebaseService.saveQuestResponse(questResponse);
      Alert.alert('Success', 'Quest response saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save quest response');
      console.error('Error saving quest response:', error);
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
          value={userProfile.email}
          onChangeText={(text) => setUserProfile({...userProfile, email: text})}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={userProfile.displayName}
          onChangeText={(text) => setUserProfile({...userProfile, displayName: text})}
        />

        <Text style={styles.subsectionTitle}>Emotional Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Current Mood"
          value={userProfile.emotionalProfile.currentMood}
          onChangeText={(text) => setUserProfile({
            ...userProfile, 
            emotionalProfile: {...userProfile.emotionalProfile, currentMood: text}
          })}
        />

        <TextInput
          style={styles.input}
          placeholder="Mood Frequency"
          value={userProfile.emotionalProfile.moodFrequency}
          onChangeText={(text) => setUserProfile({
            ...userProfile, 
            emotionalProfile: {...userProfile.emotionalProfile, moodFrequency: text}
          })}
        />

        <TextInput
          style={styles.input}
          placeholder="Emotional Needs"
          value={userProfile.emotionalProfile.emotionalNeeds}
          onChangeText={(text) => setUserProfile({
            ...userProfile, 
            emotionalProfile: {...userProfile.emotionalProfile, emotionalNeeds: text}
          })}
        />

        <TextInput
          style={styles.input}
          placeholder="Compatibility Score (0-100)"
          value={userProfile.compatibilityScore.toString()}
          onChangeText={(text) => setUserProfile({...userProfile, compatibilityScore: parseInt(text) || 0})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Total Points"
          value={userProfile.pointsProfile.totalPoints.toString()}
          onChangeText={(text) => setUserProfile({
            ...userProfile, 
            pointsProfile: {...userProfile.pointsProfile, totalPoints: parseInt(text) || 0}
          })}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Level"
          value={userProfile.pointsProfile.level}
          onChangeText={(text) => setUserProfile({
            ...userProfile, 
            pointsProfile: {...userProfile.pointsProfile, level: text}
          })}
        />

        <View style={styles.switchContainer}>
          <Text>Notifications Enabled</Text>
          <Switch
            value={userProfile.userSettings.notificationsEnabled}
            onValueChange={(value) => setUserProfile({
              ...userProfile, 
              userSettings: {...userProfile.userSettings, notificationsEnabled: value}
            })}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Theme (light/dark)"
          value={userProfile.userSettings.theme}
          onChangeText={(text) => setUserProfile({
            ...userProfile, 
            userSettings: {...userProfile.userSettings, theme: text}
          })}
        />

        <TouchableOpacity style={styles.button} onPress={saveUserProfile}>
          <Text style={styles.buttonText}>Save User Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Personality Traits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality Traits</Text>
        
        <Text>Openness (1-10): {personalityTrait.openness}</Text>
        <TextInput
          style={styles.input}
          placeholder="Openness Score"
          value={personalityTrait.openness.toString()}
          onChangeText={(text) => setPersonalityTrait({...personalityTrait, openness: parseInt(text) || 5})}
          keyboardType="numeric"
        />

        <Text>Neuroticism (1-10): {personalityTrait.neuroticism}</Text>
        <TextInput
          style={styles.input}
          placeholder="Neuroticism Score"
          value={personalityTrait.neuroticism.toString()}
          onChangeText={(text) => setPersonalityTrait({...personalityTrait, neuroticism: parseInt(text) || 5})}
          keyboardType="numeric"
        />

        <Text>Agreeableness (1-10): {personalityTrait.agreeableness}</Text>
        <TextInput
          style={styles.input}
          placeholder="Agreeableness Score"
          value={personalityTrait.agreeableness.toString()}
          onChangeText={(text) => setPersonalityTrait({...personalityTrait, agreeableness: parseInt(text) || 5})}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={savePersonalityTrait}>
          <Text style={styles.buttonText}>Save Personality Trait</Text>
        </TouchableOpacity>
      </View>

      {/* Mood History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood History</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Current Mood"
          value={moodEntry.mood}
          onChangeText={(text) => setMoodEntry({...moodEntry, mood: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Notes about your mood"
          value={moodEntry.notes}
          onChangeText={(text) => setMoodEntry({...moodEntry, notes: text})}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.button} onPress={saveMoodEntry}>
          <Text style={styles.buttonText}>Save Mood Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Points Transactions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Points Transactions</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Points"
          value={pointsTransaction.points.toString()}
          onChangeText={(text) => setPointsTransaction({...pointsTransaction, points: parseInt(text) || 0})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Transaction Type (earned/spent)"
          value={pointsTransaction.type}
          onChangeText={(text) => setPointsTransaction({...pointsTransaction, type: text as 'earned' | 'spent'})}
        />

        <TextInput
          style={styles.input}
          placeholder="Reason for transaction"
          value={pointsTransaction.reason}
          onChangeText={(text) => setPointsTransaction({...pointsTransaction, reason: text})}
        />

        <TouchableOpacity style={styles.button} onPress={savePointsTransaction}>
          <Text style={styles.buttonText}>Save Points Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Quest Responses Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quest Responses</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Quest ID"
          value={questResponse.questId}
          onChangeText={(text) => setQuestResponse({...questResponse, questId: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Your Response"
          value={questResponse.response}
          onChangeText={(text) => setQuestResponse({...questResponse, response: text})}
        />

        <TouchableOpacity style={styles.button} onPress={saveQuestResponse}>
          <Text style={styles.buttonText}>Save Quest Response</Text>
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

export default UserProfileForm; 