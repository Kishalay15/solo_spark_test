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
