import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
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
    emotionalNeeds: string;
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
export type CreatePointsTransaction = Partial<
  Omit<PointsTransaction, "timestamp">
>;

