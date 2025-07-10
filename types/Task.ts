import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/* ───── Analytics Profile ───── */
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
  personalityTraits: {
    openness: number;
    neuroticism: number;
    agreeableness: number;
  };
  categoryAffinity: { [category: string]: number };
  engagementProfile: {
    interactionFrequency: number;
    completedQuests: string[];
  };
}

/* ───── Sub‑task ───── */
export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
  pointValue?: number;
};

/* ───── Task ───── */
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
  personalityImpact?: { openness?: number; neuroticism?: number; agreeableness?: number };
};

/* Helper: update payload that allows Firestore FieldValue */
export type TaskUpdate = Partial<{
  [K in keyof Task]: Task[K] | FirebaseFirestoreTypes.FieldValue;
}>;
