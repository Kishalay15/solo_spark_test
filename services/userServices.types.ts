import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import analyticsService from "./analyticsServices";
export interface User {
  email: string;
  displayName: string;
  profileCreatedAt: FirebaseFirestoreTypes.Timestamp;
  compatibilityScore: number;
  currentPoints: number;
  lastUpdatedAt: FirebaseFirestoreTypes.Timestamp;
  privacyLevel: "private" | "friends" | "public";
  phoneNumber: string;
  emotionalProfile?: {
    emotionalNeeds: string[];
  };
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

export interface MoodState {
  state: string;
  intensity: number;
  trigger?: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
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

export type CreateUser = Partial<
  Omit<User, "profileCreatedAt" | "lastUpdatedAt">
>;
export type CreatePersonalityTrait = Partial<PersonalityTrait>;
export type CreateMoodState = Partial<Omit<MoodState, "timestamp">>;
export interface Metrics {
  categoryAffinity: {
    growth: number;
    social: number;
  };
  engagementProfile: {
    interactionFrequency: number;
    completedQuests: string[];
  };
  emotionalProfileMetrics: {
    currentMood: string;
    moodFrequency: string;
  };
}

export type CreatePointsTransaction = Partial<
  Omit<PointsTransaction, "timestamp">
>;

export interface IAnalyticsService {
  analyzeAndUpdateUserSchema: (userId: string) => Promise<any>;
}
