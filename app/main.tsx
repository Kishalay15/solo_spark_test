import firestore from '@react-native-firebase/firestore';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { User } from '../types/User';
import { Quest } from '../types/Quest';
import { Timestamp } from '@react-native-firebase/firestore';

export default function Main() {
  useEffect(() => {
    const uploadDummyData = async () => {
      const userData: User = {
        email: 'test@example.com',
        displayName: 'Test User',
        profileCreatedAt: Timestamp.now(),
        lastUpdatedAt: Timestamp.now(),
        compatibilityScore: 80,
        currentPoints: 150,
        phoneNumber: '+911234567890',
        emotionalProfile: {
          openness: { value: 8, weight: 0.9 },
          neuroticism: { value: 4, weight: 0.6 },
          agreeableness: { value: 7, weight: 0.8 },
        },
        userSettings: {
          notificationPreferences: { general: true, chat: false },
          privacyLevel: 'friends',
        },
      };

      const questData: Quest = {
        questionText: 'What motivates you the most?',
        category: 'growth',
        options: ['Money', 'Knowledge', 'Fame', 'Peace'],
        pointValue: 10,
        createdAt: Timestamp.now(),
        responseOptions: ['Money', 'Peace'],
        responseCount: 0,
      };

      await firestore().collection('solo_spark_user').doc('test_user').set(userData);
      await firestore().collection('solo_spark_quest').add(questData);
    };

    uploadDummyData();
  }, []);

  return (
    <View>
      <Text>Uploading dummy user & quest...</Text>
    </View>
  );
}