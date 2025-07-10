import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// 🧠 AnalyticsUserProfile (Enhanced with key metrics + personality)
export interface AnalyticsUserProfile {
  email: string;
  displayName: string;
  compatibilityScore: number;
  currentPoints: number;
  privacyLevel: string;
  phoneNumber?: string;
  profileCreatedAt: FirebaseFirestoreTypes.Timestamp;
  lastUpdatedAt: FirebaseFirestoreTypes.Timestamp;

  emotionalProfile: {
    currentMood: string;
    moodStabilityScore: number;
    emotionalNeeds: string[];
  };

  // ✅ Personality traits influenced by tasks
  personalityTraits: {
    openness: number;
    neuroticism: number;
    agreeableness: number;
  };

  // ✅ Category affinity to track preferences
  categoryAffinity: {
    [category: string]: number; // e.g., "growth": 4
  };

  engagementProfile: {
    interactionFrequency: number;
    completedQuests: string[];
  };
}

// ✅ SubTask (for breaking down complex tasks)
export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
  pointValue?: number;
};

// 🧩 Task Schema (Updated with personality impact + new categories)
export type Task = {
  title: string;
  description: string;
  category: 'growth' | 'social' | 'self-care' | 'learning' | 'habit' | 'custom';
  pointValue: number;

  bonusRules?: {
    earlyCompletion?: number;
    timelyResponse?: number;
    socialInteraction?: number;
  };

  createdAt: FirebaseFirestoreTypes.Timestamp;
  dueDate?: FirebaseFirestoreTypes.Timestamp;
  completed: boolean;
  completedAt?: FirebaseFirestoreTypes.Timestamp;

  rules: {
    dailyCheckIn?: boolean;
    moodStabilityReward?: boolean;
    referralBonus?: boolean;
  };

  userId: string;
  assignedUsers?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  recurrence?: {
    interval: 'daily' | 'weekly' | 'monthly';
    maxOccurrences?: number;
  };
  assignedBy?: string;
  dependencies?: string[];
  subTasks?: SubTask[];

  // ✅ Optional: Personality impact from this task
  personalityImpact?: {
    openness?: number;
    neuroticism?: number;
    agreeableness?: number;
  };
};

// 🎁 Reward Items (for redemption or badges)
export type Reward = {
  name: string;
  description: string;
  type: 'digital' | 'physical' | 'badge';
  cost: number;
  imageUrl?: string;
  stock?: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  available: boolean;
};

// 🛒 Redemption Record (Enhanced with audit trail)
export type Redemption = {
  userId: string;
  itemId: string;
  itemName: string;
  pointsUsed: number;
  redeemedAt: FirebaseFirestoreTypes.Timestamp;
  redeemedVia: 'taskCompletion' | 'shop';
  rewardType: Reward['type'];
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: FirebaseFirestoreTypes.Timestamp;
};
