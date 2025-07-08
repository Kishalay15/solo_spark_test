import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import analyticsService from '../../services/analyticsService';

interface PersonalityTrait {
  id: string;
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: any;
}

interface MoodEntry {
  id: string;
  mood: string;
  notes: string;
  timestamp: any;
}

interface QuestResponse {
  id: string;
  questId: string;
  response: string;
  timestamp: any;
}

export default function ExploreScreen() {
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTrait[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [questResponses, setQuestResponses] = useState<QuestResponse[]>([]);
  const [comprehensiveAnalytics, setComprehensiveAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [traits, moods, responses, analytics] = await Promise.all([
        analyticsService.fetchPersonalityTraits(),
        analyticsService.fetchMoodEntries(),
        analyticsService.fetchQuestResponses(),
        analyticsService.getComprehensiveAnalytics(),
      ]);

      setPersonalityTraits(traits);
      setMoodEntries(moods);
      setQuestResponses(responses);
      setComprehensiveAnalytics(analytics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to load data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  };

  const updateUserSchema = async () => {
    try {
      setIsUpdating(true);
      const results = await analyticsService.analyzeAndUpdateUserSchema();
      
      let message = 'User schema updated:\n';
      if (results.personalityUpdated) message += '• Personality traits\n';
      if (results.moodUpdated) message += '• Current mood\n';
      if (results.emotionalNeedsUpdated) message += '• Emotional needs\n';
      if (results.compatibilityScoreUpdated) message += '• Compatibility score\n';
      
      Alert.alert('Success', message);
      await loadAllData(); // Reload data to show updates
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to update user schema: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const testMoodUpdate = async () => {
    try {
      setIsUpdating(true);
      console.log('🧪 Testing mood update specifically...');
      
      // First, let's see what quest responses we have
      const responses = await analyticsService.fetchQuestResponses();
      console.log('📝 Found quest responses:', responses.length);
      
      if (responses.length === 0) {
        Alert.alert('No Data', 'No quest responses found. Please add some quest responses first.');
        return;
      }
      
      // Show the responses for debugging
      responses.forEach((response, index) => {
        console.log(`Response ${index + 1}:`, response.response);
      });
      
      const results = await analyticsService.analyzeAndUpdateUserSchema();
      
      let message = 'Mood update test results:\n';
      message += `• Personality updated: ${results.personalityUpdated ? 'Yes' : 'No'}\n`;
      message += `• Mood updated: ${results.moodUpdated ? 'Yes' : 'No'}\n`;
      message += `• Emotional needs updated: ${results.emotionalNeedsUpdated ? 'Yes' : 'No'}\n`;
      message += `• Compatibility score updated: ${results.compatibilityScoreUpdated ? 'Yes' : 'No'}\n`;
      
      Alert.alert('Mood Test Results', message);
      await loadAllData(); // Reload data to show updates
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Mood test failed: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading analytics data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
      <Text style={styles.title}>User Analytics Dashboard</Text>

      {/* Comprehensive Analytics Summary */}
      {comprehensiveAnalytics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 User Profile Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Responses</Text>
              <Text style={styles.summaryValue}>{comprehensiveAnalytics.totalResponses}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Mood</Text>
              <Text style={styles.summaryValue}>{comprehensiveAnalytics.moodTrend}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Emotional Needs</Text>
              <Text style={styles.summaryValue}>{comprehensiveAnalytics.emotionalNeeds}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Compatibility</Text>
              <Text style={styles.summaryValue}>{comprehensiveAnalytics.compatibilityScore}</Text>
            </View>
          </View>
        </View>
      )}

      {/* User Profile Details */}
      {comprehensiveAnalytics?.userProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 User Profile</Text>
          <View style={styles.profileCard}>
            <Text style={styles.profileText}>Name: {comprehensiveAnalytics.userProfile.displayName}</Text>
            <Text style={styles.profileText}>Email: {comprehensiveAnalytics.userProfile.email}</Text>
            <Text style={styles.profileText}>Current Mood: {comprehensiveAnalytics.userProfile.emotionalProfile.currentMood}</Text>
            <Text style={styles.profileText}>Mood Frequency: {comprehensiveAnalytics.userProfile.emotionalProfile.moodFrequency}</Text>
            <Text style={styles.profileText}>Emotional Needs: {comprehensiveAnalytics.userProfile.emotionalProfile.emotionalNeeds}</Text>
            <Text style={styles.profileText}>Compatibility Score: {comprehensiveAnalytics.userProfile.compatibilityScore}</Text>
            <Text style={styles.profileText}>Total Points: {comprehensiveAnalytics.userProfile.pointsProfile.totalPoints}</Text>
            <Text style={styles.profileText}>Level: {comprehensiveAnalytics.userProfile.pointsProfile.level}</Text>
          </View>
        </View>
      )}

      {/* Update Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Update User Schema</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, isUpdating && styles.buttonDisabled]}
          onPress={updateUserSchema}
          disabled={isUpdating}
        >
          <Text style={styles.actionButtonText}>
            {isUpdating ? 'Analyzing & Updating...' : 'Analyze & Update User Schema'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, isUpdating && styles.buttonDisabled]}
          onPress={testMoodUpdate}
          disabled={isUpdating}
        >
          <Text style={styles.actionButtonText}>
            {isUpdating ? 'Testing...' : '🧪 Test Mood Update'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.actionDescription}>
          This will analyze all quest responses and update personality traits, mood, emotional needs, and compatibility score based on response patterns.
        </Text>
      </View>

      {/* Response Patterns */}
      {comprehensiveAnalytics?.responsePatterns && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Response Patterns</Text>
          {Object.keys(comprehensiveAnalytics.responsePatterns).length === 0 ? (
            <Text style={styles.noDataText}>No response patterns found</Text>
          ) : (
            Object.entries(comprehensiveAnalytics.responsePatterns).map(([category, count]) => (
              <View key={category} style={styles.patternCard}>
                <Text style={styles.patternCategory}>{category}</Text>
                <Text style={styles.patternCount}>{count as number} responses</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Personality Traits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧠 Personality Traits</Text>
        {personalityTraits.length === 0 ? (
          <Text style={styles.noDataText}>No personality traits found</Text>
        ) : (
          personalityTraits.slice(0, 5).map((trait, index) => (
            <View key={trait.id} style={styles.traitCard}>
              <Text style={styles.traitTitle}>Trait #{personalityTraits.length - index}</Text>
              <View style={styles.traitStats}>
                <Text style={styles.traitStat}>Openness: {trait.openness.toFixed(1)}</Text>
                <Text style={styles.traitStat}>Neuroticism: {trait.neuroticism.toFixed(1)}</Text>
                <Text style={styles.traitStat}>Agreeableness: {trait.agreeableness.toFixed(1)}</Text>
              </View>
              <Text style={styles.traitDate}>
                {trait.timestamp?.toDate().toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Mood History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>😊 Mood History</Text>
        {moodEntries.length === 0 ? (
          <Text style={styles.noDataText}>No mood entries found</Text>
        ) : (
          moodEntries.slice(0, 5).map((mood, index) => (
            <View key={mood.id} style={styles.moodCard}>
              <Text style={styles.moodTitle}>{mood.mood}</Text>
              <Text style={styles.moodNotes}>{mood.notes}</Text>
              <Text style={styles.moodDate}>
                {mood.timestamp?.toDate().toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Quest Responses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ Recent Quest Responses</Text>
        {questResponses.length === 0 ? (
          <Text style={styles.noDataText}>No quest responses found</Text>
        ) : (
          questResponses.slice(0, 5).map((response, index) => (
            <View key={response.id} style={styles.responseCard}>
              <Text style={styles.responseTitle}>Response #{questResponses.length - index}</Text>
              <Text style={styles.responseText}>{response.response}</Text>
              <Text style={styles.responseDate}>
                {response.timestamp?.toDate().toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  profileText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  patternCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  patternCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  patternCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  traitCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  traitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  traitStats: {
    marginBottom: 8,
  },
  traitStat: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  traitDate: {
    fontSize: 12,
    color: '#999',
  },
  moodCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  moodNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  moodDate: {
    fontSize: 12,
    color: '#999',
  },
  responseCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  responseDate: {
    fontSize: 12,
    color: '#999',
  },
});
