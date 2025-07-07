import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import firebaseService from '../services/firebaseService';

interface QuestFormProps {
  onBack: () => void;
}

const QuestForm: React.FC<QuestFormProps> = ({ onBack }) => {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('emotional intelligence');
  const [options, setOptions] = useState(['', '', '', '']); // Support up to 4 options
  const [pointValue, setPointValue] = useState('10');
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) { // Max 6 options
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) { // Min 2 options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const validateForm = (): boolean => {
    if (!questionText.trim()) {
      Alert.alert('Error', 'Please enter a question text');
      return false;
    }
    
    if (!category.trim()) {
      Alert.alert('Error', 'Please enter a category');
      return false;
    }

    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      Alert.alert('Error', 'Please enter at least 2 options');
      return false;
    }

    const points = parseInt(pointValue);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Error', 'Please enter a valid point value (greater than 0)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const validOptions = options.filter(option => option.trim() !== '');
      
      const questData = {
        questionText: questionText.trim(),
        category: category.trim(),
        options: validOptions,
        pointValue: parseInt(pointValue),
      };

      const questId = await firebaseService.saveQuest(questData);
      
      Alert.alert(
        'Success', 
        `Quest saved successfully!\nQuest ID: ${questId}`,
        [
          {
            text: 'OK',
            onPress: () => clearForm()
          }
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to save quest: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setQuestionText('');
    setCategory('emotional intelligence');
    setOptions(['', '', '', '']);
    setPointValue('10');
  };

  const predefinedCategories = [
    'emotional intelligence',
    'personality',
    'relationships',
    'self-awareness',
    'communication',
    'stress management',
    'motivation',
    'creativity'
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create New Quest</Text>
      </View>
      
      {/* Question Text */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Question Text *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="Enter your question here..."
          multiline
          numberOfLines={3}
          maxLength={500}
        />
        <Text style={styles.characterCount}>{questionText.length}/500</Text>
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.textInput}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g., emotional intelligence"
        />
        <Text style={styles.hint}>Common categories: {predefinedCategories.join(', ')}</Text>
      </View>

      {/* Options */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Options * (2-6 options)</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <TextInput
              style={[styles.textInput, styles.optionInput]}
              value={option}
              onChangeText={(value) => handleOptionChange(index, value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              maxLength={100}
            />
            {options.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeOption(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {options.length < 6 && (
          <TouchableOpacity style={styles.addButton} onPress={addOption}>
            <Text style={styles.addButtonText}>+ Add Option</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Point Value */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Point Value *</Text>
        <TextInput
          style={styles.textInput}
          value={pointValue}
          onChangeText={setPointValue}
          placeholder="10"
          keyboardType="numeric"
          maxLength={3}
        />
        <Text style={styles.hint}>Points awarded for completing this quest</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Quest'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearForm}
          disabled={isLoading}
        >
          <Text style={styles.clearButtonText}>Clear Form</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      {questionText && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview:</Text>
          <Text style={styles.previewText}>Question: {questionText}</Text>
          <Text style={styles.previewText}>Category: {category}</Text>
          <Text style={styles.previewText}>Points: {pointValue}</Text>
          <Text style={styles.previewText}>Options:</Text>
          {options.filter(option => option.trim() !== '').map((option, index) => (
            <Text key={index} style={styles.previewOption}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          ))}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
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
    alignItems: 'center',
  },
  clearButtonText: {
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
  previewOption: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default QuestForm; 