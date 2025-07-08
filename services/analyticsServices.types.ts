export interface AnalyticsPersonalityTrait {
  id: string;
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: any;
}

export interface AnalyticsMoodEntry {
  id: string;
  mood: string;
  notes: string;
  timestamp: any;
}

export interface AnalyticsQuestResponse {
  id: string;
  questId: string;
  response: string;
  timestamp: any;
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
