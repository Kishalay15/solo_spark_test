import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface AnalyticsPersonalityTrait {
  id: string;
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface AnalyticsMoodEntry {
  id: string;
  mood: string;
  notes: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface AnalyticsQuestResponse {
  id: string;
  questId: string;
  response: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface AnalyticsQuest {
  id: string;
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}

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
    emotionalNeeds: string[];
  };
}

export interface PersonalityResponse {
  openness: number;
  neuroticism: number;
  agreeableness: number;
}

export interface MoodScore {
  positive: number;
  negative: number;
  neutral: number;
}

export type ResponsePatterns = {
  [key: string]: number;
};

export interface AnalysisResult {
  personalityChanges: PersonalityResponse;
  moodTrend: string;
  moodScores: MoodScore;
  emotionalNeeds: string[];
  responsePatterns: ResponsePatterns;
}
