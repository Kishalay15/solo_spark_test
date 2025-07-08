import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface UserProfile {
  email: string;
  displayName: string;
  profileCreatedAt: FirebaseFirestoreTypes.Timestamp;
  lastUpdatedAt: FirebaseFirestoreTypes.Timestamp;
  emotionalProfile: {
    currentMood: string;
    moodFrequency: string;
    emotionalNeeds: string;
  };
  compatibilityScore: number;
  pointsProfile: {
    totalPoints: number;
    level: string;
  };
  userSettings: {
    notificationsEnabled: boolean;
    theme: string;
  };
}

export interface PersonalityTrait {
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface MoodEntry {
  mood: string;
  notes: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface PointsTransaction {
  points: number;
  type: "earned" | "spent";
  reason: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface QuestResponse {
  questId: string;
  response: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface Quest {
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}
