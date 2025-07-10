import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// ✅ Personality Trait Tracking
export interface AnalyticsPersonalityTrait {
  id: string;
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

// ✅ Mood Entry Logging
export interface AnalyticsMoodEntry {
  id: string;
  mood: string;
  notes: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

// ✅ Quest Responses
export interface AnalyticsQuestResponse {
  id: string;
  questId: string;
  response: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

// ✅ Quest Metadata
export interface AnalyticsQuest {
  id: string;
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}

// ✅ 🔥 Boss-Required: User Profile Analytics
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

// ✅ Aggregated Personality Result
export interface PersonalityResponse {
  openness: number;
  neuroticism: number;
  agreeableness: number;
}

// ✅ Mood Score Summary
export interface MoodScore {
  positive: number;
  negative: number;
  neutral: number;
}

// ✅ Patterned Quest Responses
export type ResponsePatterns = {
  [key: string]: number;
};

// ✅ Final Analysis Result
export interface AnalysisResult {
  personalityChanges: PersonalityResponse;
  moodTrend: string;
  moodScores: MoodScore;
  emotionalNeeds: string;
  responsePatterns: ResponsePatterns;
}
