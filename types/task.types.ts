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
