import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { QuestResponse } from "./userServices.types";

export interface Quest {
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  responseOptions: string[];
  responseCount?: number;
}

export type CreateQuestResponse = Partial<Omit<QuestResponse, "timestamp">>;
export type CreateQuest = Partial<Omit<Quest, "createdAt">>;
