import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type SubTask = {
  title: string;
  completed: boolean;
  pointValue?: number;
};

export type CreateTask = {
  title: string;
  description: string;
  category: "growth" | "social" | "self-care" | "learning" | "habit" | "custom";
  pointValue: number;
  bonusRules?: {
    earlyCompletion?: number;
    timelyResponse?: number;
    socialInteraction?: number;
  };
  dueDate?: FirebaseFirestoreTypes.Timestamp;
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
  personalityImpact?: {
    openness?: number;
    neuroticism?: number;
    agreeableness?: number;
  };
};

export type UpdateTask = Partial<CreateTask> & {
  completed?: boolean;
  completedAt?: FirebaseFirestoreTypes.Timestamp;
};

export interface UpdatedUserForTask {
  email: string;
  displayName: string;
  compatibilityScore: number;
  currentPoints: number;
  privacyLevel: string;
  phoneNumber?: string;
  profileCreatedAt: FirebaseFirestoreTypes.Timestamp;
  lastUpdatedAt: FirebaseFirestoreTypes.Timestamp;
  categoryAffinity: {
    [category: string]: number;
  };
  engagementProfile: {
    interactionFrequency: number;
    completedQuests: string[];
  };
}
