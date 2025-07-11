import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Quest {
  questionText: string;
  category: "values" | "growth";
  options: string[];
  pointValue: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  responseOptions: string[];
  responseCount?: number;
}