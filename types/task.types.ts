import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

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
  personalityImpact?: {
    openness?: number;
    neuroticism?: number;
    agreeableness?: number;
  };
};

export type SubTask = {
  title: string;
  completed: boolean;
  pointValue?: number;
};

//up for discussion
export interface UpdatedUserForTask {
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

  //tasks will target this and change this
  personalityTraits: {
    openness: number;
    neuroticism: number;
    agreeableness: number;
  };

  //will store number of tasks from same category, thus propting our app to provide tasks of similar category over time
  categoryAffinity: {
    [category: string]: number; // e.g., "growth": 4
  };

  //this measures overall attribute (might be an overhead and not needed)
  engagementProfile: {
    interactionFrequency: number;
    completedQuests: string[];
  };
}

