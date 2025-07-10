import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface Quest {
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  responseOptions: string[];
  responseCount?: number;
}

