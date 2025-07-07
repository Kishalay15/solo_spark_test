// app/main.tsx

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types/User';
import { Quest } from '../types/Quest';
import { Task } from '../types/Task';
import { ShopItem } from '../types/ShopItem';

export default function Main() {
  useEffect(() => {
    const uploadDummyData = async () => {
      try {
        // ✅ Dummy User Data
        const userData: User = {
          email: 'test@example.com',
          displayName: 'Test User',
          profileCreatedAt: firestore.Timestamp.now(),
          lastUpdatedAt: firestore.Timestamp.now(),
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

        // ✅ Dummy Quest Data
        const questData: Quest = {
          questionText: 'What motivates you the most?',
          category: 'growth',
          options: ['Money', 'Knowledge', 'Fame', 'Peace'],
          pointValue: 10,
          createdAt: firestore.Timestamp.now(),
          responseOptions: ['Money', 'Peace'],
          responseCount: 0,
        };

        // ✅ Dummy Task Data
        const taskData: Task = {
          title: 'Complete daily reflection',
          description: 'Write your thoughts about today',
          category: 'self-awareness',
          createdAt: firestore.Timestamp.now(),
          pointValue: 20,
          repeatable: true,
          rules: [
            'Complete within 24 hours',
            'Must be at least 3 sentences long',
          ],
        };

        // ✅ Dummy Shop Item
        const shopItemData: ShopItem = {
          name: 'Meditation Booster',
          description: 'Use this to enhance your daily calmness',
          cost: 50,
          rewardType: 'feature-unlock',
          available: true,
          createdAt: firestore.Timestamp.now(),
        };

        // ✅ Upload to Firestore
        await firestore().collection('solo_spark_user').doc('test_user').set(userData);
        await firestore().collection('solo_spark_quest').add(questData);
        await firestore().collection('solo_spark_tasks').add(taskData);
        await firestore().collection('solo_spark_shop').add(shopItemData);

        console.log('✅ Dummy user, quest, task & shop item uploaded!');
      } catch (err) {
        console.error('❌ Firestore upload failed:', err);
      }
    };

    uploadDummyData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>🚀 Uploading dummy data to Firebase...</Text>
    </View>
  );
}
