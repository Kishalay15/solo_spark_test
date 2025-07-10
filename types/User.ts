import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface User {
  email: string;
  displayName: string;
  phoneNumber: string;
  compatibilityScore: number;
  currentPoints: number;
  profileCreatedAt: FirebaseFirestoreTypes.Timestamp;
  lastUpdatedAt: FirebaseFirestoreTypes.Timestamp;
  emotionalProfile: PersonalityTrait;
  userSettings: UserSettings;
  moodLogs?: MoodState[];                  // Optional array of mood logs
  moodFrequency?: MoodFrequency;
  pointsHistory?: PointsTransaction[];
  questResponses?: QuestResponse[];
  emotionalNeeds?: EmotionalNeeds;
}

// Mood data and states
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

// Settings and preferences
export interface UserSettings {
  notificationPreferences: Record<string, boolean>;
  privacyLevel: 'private' | 'friends' | 'public';
}

// Personality breakdown
export interface PersonalityTrait {
  openness: TraitScore;
  neuroticism: TraitScore;
  agreeableness: TraitScore;
}

export interface TraitScore {
  value: number;
  weight: number;
}

// Emotional needs of the user
export interface EmotionalNeeds {
  empathy: EmotionalValues;
  validation: EmotionalValues;
}

export interface EmotionalValues {
  type: string;
  intensity: number;
}

// Points-related transactions (earned, bonuses, etc.)
export interface PointsTransaction {
  amount: number;
  type: 'earned' | 'bonus';
  reason: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  expiryDate?: FirebaseFirestoreTypes.Timestamp;
}

// Quest responses tied to the user
export interface QuestResponse {
  questId: string;
  response: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}
