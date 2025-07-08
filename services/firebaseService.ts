import firestore from '@react-native-firebase/firestore';

class FirebaseService {
  private getCurrentUserId(): string {
    return 'demo-user-123';
  }

  async saveUserProfile(userData: any): Promise<void> {
    try {
      console.log('🔥 Starting Firebase save...');
      console.log('📊 User data to save:', userData);
      
      const userId = this.getCurrentUserId();
      console.log('👤 User ID:', userId);
      
      // Create the user profile with proper structure
      const userProfileData = {
        email: userData.email || 'test@example.com',
        displayName: userData.displayName || 'Test User',
        profileCreatedAt: firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        emotionalProfile: {
          currentMood: userData.emotionalProfile?.currentMood || 'Happy',
          moodFrequency: userData.emotionalProfile?.moodFrequency || 'Daily',
          emotionalNeeds: userData.emotionalProfile?.emotionalNeeds || 'Support',
        },
        compatibilityScore: userData.compatibilityScore || 85,
        pointsProfile: {
          totalPoints: userData.pointsProfile?.totalPoints || 100,
          level: userData.pointsProfile?.level || 'Beginner',
        },
        userSettings: {
          notificationsEnabled: userData.userSettings?.notificationsEnabled ?? true,
          theme: userData.userSettings?.theme || 'light',
        },
      };

      console.log('📝 Attempting to save to Firebase...');
      await firestore().collection('solo_spark_user').doc(userId).set(userProfileData);
      
      console.log('✅ Real Firebase: User profile saved successfully!');
      console.log('📊 Saved data:', userProfileData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as any)?.code || 'Unknown';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      console.error('❌ Firebase Error:', error);
      console.error('❌ Error details:', {
        message: errorMessage,
        code: errorCode,
        stack: errorStack
      });
      throw error;
    }
  }

  async savePersonalityTrait(traitData: any): Promise<string> {
    try {
      const userId = this.getCurrentUserId();
      
      // Create personality trait with proper structure
      const traitWithTimestamp = {
        openness: traitData.openness || 0.5,
        neuroticism: traitData.neuroticism || 0.3,
        agreeableness: traitData.agreeableness || 0.7,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('PersonalityTraits')
        .add(traitWithTimestamp);

      console.log('✅ Real Firebase: Personality trait saved successfully', traitWithTimestamp);
      return docRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Firebase Error:', errorMessage);
      throw error;
    }
  }

  async saveMoodEntry(moodData: any): Promise<string> {
    try {
      const userId = this.getCurrentUserId();
      
      // Create mood entry with proper structure
      const moodWithTimestamp = {
        mood: moodData.mood || 'Happy',
        timestamp: firestore.FieldValue.serverTimestamp(),
        notes: moodData.notes || 'Mood entry',
      };

      const docRef = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('MoodHistory')
        .add(moodWithTimestamp);

      console.log('✅ Real Firebase: Mood entry saved successfully', moodWithTimestamp);
      return docRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Firebase Error:', errorMessage);
      throw error;
    }
  }

  async savePointsTransaction(transactionData: any): Promise<string> {
    try {
      const userId = this.getCurrentUserId();
      
      // Create points transaction with proper structure
      const transactionWithTimestamp = {
        points: transactionData.points || 10,
        type: transactionData.type || 'earned', // 'earned' | 'spent'
        reason: transactionData.reason || 'Test transaction',
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('PointsTransactions')
        .add(transactionWithTimestamp);

      // Update user's total points
      const userDoc = await firestore().collection('solo_spark_user').doc(userId).get();
      const currentPoints = userDoc.data()?.pointsProfile?.totalPoints || 0;
      
      const newTotalPoints = transactionWithTimestamp.type === 'earned' 
        ? currentPoints + transactionWithTimestamp.points 
        : currentPoints - transactionWithTimestamp.points;

      await firestore().collection('solo_spark_user').doc(userId).update({
        'pointsProfile.totalPoints': Math.max(0, newTotalPoints),
        lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ Real Firebase: Points transaction saved successfully', transactionWithTimestamp);
      return docRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Firebase Error:', errorMessage);
      throw error;
    }
  }

  async saveQuestResponse(responseData: any): Promise<string> {
    try {
      const userId = this.getCurrentUserId();
      
      // Create quest response with proper structure
      const responseWithTimestamp = {
        questId: responseData.questId || 'quest-123',
        response: responseData.response || 'Option A',
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('QuestResponses')
        .add(responseWithTimestamp);

      console.log('✅ Real Firebase: Quest response saved successfully', responseWithTimestamp);
      return docRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Firebase Error:', errorMessage);
      throw error;
    }
  }

  async saveQuest(questData: any): Promise<string> {
    try {
      // Create quest with proper structure
      const questWithId = {
        questionText: questData.questionText || 'How are you feeling today?',
        category: questData.category || 'emotional intelligence',
        options: questData.options || ['A. Happy', 'B. Sad', 'C. Neutral'],
        pointValue: questData.pointValue || 10,
      };

      const docRef = await firestore()
        .collection('solo_spark_quest')
        .add(questWithId);

      console.log('✅ Real Firebase: Quest saved successfully', questWithId);
      return docRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Firebase Error:', errorMessage);
      throw error;
    }
  }

  // Method to create a complete user profile with all subcollections
  async createCompleteUserProfile(): Promise<void> {
    try {
      console.log('🔥 Creating complete user profile with subcollections...');
      
      // First, create the main user profile
      await this.saveUserProfile({
        email: 'complete@example.com',
        displayName: 'Complete User',
        emotionalProfile: {
          currentMood: 'Excited',
          moodFrequency: 'Weekly',
          emotionalNeeds: 'Connection',
        },
        compatibilityScore: 92,
        pointsProfile: {
          totalPoints: 250,
          level: 'Intermediate',
        },
        userSettings: {
          notificationsEnabled: true,
          theme: 'dark',
        },
      });

      // Create personality traits
      await this.savePersonalityTrait({
        openness: 0.8,
        neuroticism: 0.2,
        agreeableness: 0.9,
      });

      // Create mood entries
      await this.saveMoodEntry({
        mood: 'Happy',
        notes: 'Had a great day!',
      });

      await this.saveMoodEntry({
        mood: 'Calm',
        notes: 'Feeling peaceful',
      });

      // Create points transactions
      await this.savePointsTransaction({
        points: 50,
        type: 'earned',
        reason: 'Completed daily quest',
      });

      await this.savePointsTransaction({
        points: 20,
        type: 'spent',
        reason: 'Unlocked new feature',
      });

      // Create a quest first
      const questId = await this.saveQuest({
        questionText: 'What would you do when feeling stressed?',
        category: 'emotional intelligence',
        options: ['A. Take deep breaths', 'B. Go for a walk', 'C. Talk to someone'],
        pointValue: 15,
      });

      // Create quest response
      await this.saveQuestResponse({
        questId: questId,
        response: 'A. Take deep breaths',
      });

      console.log('✅ Complete user profile created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error creating complete profile:', errorMessage);
      throw error;
    }
  }
}

const firebaseService = new FirebaseService();

// Types
export interface UserProfile {
  email: string;
  displayName: string;
  profileCreatedAt: any;
  lastUpdatedAt: any;
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

export interface PersonalityTrait {
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: any;
}

export interface MoodEntry {
  mood: string;
  notes: string;
  timestamp: any;
}

export interface PointsTransaction {
  points: number;
  type: 'earned' | 'spent';
  reason: string;
  timestamp: any;
}

export interface QuestResponse {
  questId: string;
  response: string;
  timestamp: any;
}

export interface Quest {
  id: string;
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}

export default firebaseService; 