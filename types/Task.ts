// types/Task.ts

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// 🧠 User Analytics Profile
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
    moodFrequency: string;
    emotionalNeeds: string;
  };
}

// ✅ SubTask (for breaking down complex tasks)
export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
  pointValue?: number;
};

// 🧩 Task Schema
export type Task = {
  id?: string; // Firestore auto-generates this
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'custom';
  pointValue: number;
  bonusPoints?: number; // Optional extra points
  createdAt: FirebaseFirestoreTypes.Timestamp;
  dueDate?: FirebaseFirestoreTypes.Timestamp;
  completed: boolean;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
  rules: string[]; // Conditions or steps
  userId: string; // Reference to the user
  difficulty?: 'easy' | 'medium' | 'hard'; // Optional difficulty tag
  tags?: string[]; // For searching or filtering
  recurrence?: {
    interval: 'daily' | 'weekly' | 'monthly';
    repeatUntil?: FirebaseFirestoreTypes.Timestamp;
  };
  assignedBy?: string; // For admin/peer assigned tasks
  dependencies?: string[]; // IDs of tasks that must be completed first
  subTasks?: SubTask[]; // Array of sub-tasks
};

// 🎁 Reward Items (for redemption or badges)
export type Reward = {
  id?: string;
  name: string;
  description: string;
  type: 'digital' | 'physical' | 'badge';
  cost: number;
  imageUrl?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  available: boolean;
};

// 🛒 Redemption Record
export type Redemption = {
  redemptionId?: string;
  userId: string;
  itemId: string;
  itemName: string;
  pointsUsed: number;
  redeemedAt: FirebaseFirestoreTypes.Timestamp;
  redeemedVia: 'taskCompletion' | 'shop';
  rewardType: Reward['type'];
  status: 'pending' | 'approved' | 'rejected';
};
