import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import firebaseService from '../services/firebaseService';

interface Quest {
  id: string;
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}

interface QuestResponseFormProps {
  onBack: () => void;
}

const QuestResponseForm: React.FC<QuestResponseFormProps> = ({ onBack }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setIsLoadingQuests(true);
      const questsSnapshot = await firestore()
        .collection('solo_spark_quest')
        .get();

      const questsData: Quest[] = [];
      questsSnapshot.forEach((doc) => {
        questsData.push({
          id: doc.id,
          ...doc.data(),
        } as Quest);
      });

      setQuests(questsData);
      console.log(`✅ Loaded ${questsData.length} quests from Firebase`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error loading quests:', errorMessage);
      Alert.alert('Error', `Failed to load quests: ${errorMessage}`);
    } finally {
      setIsLoadingQuests(false);
    }
  };

  const handleQuestSelection = (quest: Quest) => {
    setSelectedQuest(quest);
    setSelectedOption(''); // Reset selected option when quest changes
  };

  const handleOptionSelection = (option: string) => {
    setSelectedOption(option);
  };

  const validateForm = (): boolean => {
    if (!selectedQuest) {
      Alert.alert('Error', 'Please select a quest');
      return false;
    }

    if (!selectedOption) {
      Alert.alert('Error', 'Please select an option');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const responseData = {
        questId: selectedQuest!.id,
        response: selectedOption,
      };

      const responseId = await firebaseService.saveQuestResponse(responseData);
      
      Alert.alert(
        'Success', 
        `Quest response saved successfully!\nResponse ID: ${responseId}`,
        [
          {
            text: 'OK',
            onPress: () => clearForm()
          }
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to save quest response: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setSelectedQuest(null);
    setSelectedOption('');
  };

  const refreshQuests = () => {
    loadQuests();
  };

  if (isLoadingQuests) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Answer a Quest</Text>
      </View>
      
      {/* Quest Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Quest *</Text>
        <Text style={styles.scrollHint}>💡 Scroll horizontally to see all quests</Text>
        {quests.length === 0 ? (
          <View style={styles.noQuestsContainer}>
            <Text style={styles.noQuestsText}>No quests available</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshQuests}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.questScrollContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.questScrollContent}
            bounces={true}
          >
            {quests.map((quest) => (
              <TouchableOpacity
                key={quest.id}
                style={[
                  styles.questCard,
                  selectedQuest?.id === quest.id && styles.selectedQuestCard
                ]}
                onPress={() => handleQuestSelection(quest)}
              >
                <Text style={styles.questCategory}>{quest.category}</Text>
                <Text style={styles.questText} numberOfLines={3}>
                  {quest.questionText}
                </Text>
                <Text style={styles.questPoints}>{quest.pointValue} points</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Selected Quest Details */}
      {selectedQuest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Quest:</Text>
          <View style={styles.selectedQuestContainer}>
            <Text style={styles.selectedQuestText}>{selectedQuest.questionText}</Text>
            <Text style={styles.selectedQuestCategory}>Category: {selectedQuest.category}</Text>
            <Text style={styles.selectedQuestPoints}>Points: {selectedQuest.pointValue}</Text>
          </View>
        </View>
      )}

      {/* Response Options */}
      {selectedQuest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Answer *</Text>
          {selectedQuest.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedOptionButton
              ]}
              onPress={() => handleOptionSelection(option)}
            >
              <Text style={[
                styles.optionText,
                selectedOption === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading || !selectedQuest || !selectedOption}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Response'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearForm}
          disabled={isLoading}
        >
          <Text style={styles.clearButtonText}>Clear Form</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshQuests}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>Refresh Quests</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      {selectedQuest && selectedOption && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview:</Text>
          <Text style={styles.previewText}>Quest: {selectedQuest.questionText}</Text>
          <Text style={styles.previewText}>Your Answer: {selectedOption}</Text>
          <Text style={styles.previewText}>Points: {selectedQuest.pointValue}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  scrollHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  noQuestsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  questScrollContainer: {
    maxHeight: 300,
    marginBottom: 10,
  },
  questScrollContent: {
    paddingVertical: 10,
  },
  noQuestsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  questCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedQuestCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  questCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  questText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  questPoints: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedQuestContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedQuestText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  selectedQuestCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  selectedQuestPoints: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  selectedOptionButton: {
    borderColor: '#34C759',
    borderWidth: 2,
    backgroundColor: '#f0fff0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#34C759',
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  previewContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default QuestResponseForm; 