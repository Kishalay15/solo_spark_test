import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface Quest {
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  responseOptions: string[];
  responseCount?: number;
}

export interface User {
  email: string;
  displayName: string;
  profileCreatedAt: FirebaseFirestoreTypes.Timestamp;
  lastUpdatedAt: FirebaseFirestoreTypes.Timestamp;
  compatibilityScore: number;
  currentPoints: number;
  privacyLevel: "private" | "friends" | "public";
  phoneNumber: string;
  emotionalProfile?: {
    currentMood: string;
    moodFrequency: string;
    emotionalNeeds: string[];
  };
}

export interface MoodState {
  state: string;
  intensity: number;
  trigger?: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface MoodFrequency {
  dailyChanges: number;
  weeklyAverage: number;
}

export interface UserSettings {
  notificationPreferences: Record<string, boolean>;
  privacyLevel: "private" | "friends" | "public";
}

export interface PersonalityTrait {
  openness: traitScore;
  neuroticism: traitScore;
  agreeableness: traitScore;
}

export interface traitScore {
  value: number;
  weight: number;
}

export interface EmotionalNeeds {
  empathy: emotionalValues;
  validation: emotionalValues;
}

export interface emotionalValues {
  type: string;
  intensity: number;
}

export interface PointsTransaction {
  amount: number;
  type: "earned" | "bonus";
  reason: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  expiryDate?: FirebaseFirestoreTypes.Timestamp;
}

export interface QuestResponse {
  questId: string;
  response: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export type Task = {
  title: string;
  description: string;
  category: "growth" | "social" | "self-care" | "learning" | "habit" | "custom";
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
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  recurrence?: {
    interval: "daily" | "weekly" | "monthly";
    maxOccurrences?: number;
  };
  assignedBy?: string;
  dependencies?: string[];
  subTasks?: SubTask[];
  //up for discussion
  // personalityImpact?: {
  //   openness?: number;
  //   neuroticism?: number;
  //   agreeableness?: number;
  // };
};

export type SubTask = {
  title: string;
  completed: boolean;
  pointValue?: number;
};

export type Reward = {
  name: string;
  description: string;
  type: "digital" | "physical" | "badge";
  cost: number;
  imageUrl?: string;
  stock?: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  available: boolean;
};

export type Redemption = {
  userId: string;
  itemId: string;
  itemName: string;
  pointsUsed: number;
  redeemedAt: FirebaseFirestoreTypes.Timestamp;
  redeemedVia: "taskCompletion" | "shop";
  rewardType: Reward["type"];
  status: "pending" | "approved" | "rejected";
  processedAt?: FirebaseFirestoreTypes.Timestamp;
};

export type ShopItem = {
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
};
