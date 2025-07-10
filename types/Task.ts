import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// 🧠 AnalyticsUserProfile (Enhanced with key metrics)
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
    moodStabilityScore: number; // Added for analytics
    emotionalNeeds: string[]; // Array for multiple needs
  };
  engagementProfile: {
    interactionFrequency: number;
    completedQuests: string[]; // Link to Tasks
  };
}

// ✅ SubTask (for breaking down complex tasks)
export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
  pointValue?: number;
};

// 🧩 Task Schema (Updated with relationships and rules)
export type Task = {
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'custom';
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
};

// 🎁 Reward Items (for redemption or badges)
export type Reward = {
  name: string;
  description: string;
  type: 'digital' | 'physical' | 'badge';
  cost: number;
  imageUrl?: string;
  stock?: number; // ✅ ADDED to track item availability
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
