// types/Task.ts

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// 🧩 Task Schema
export type Task = {
  id?: string; // Firestore auto-generates this
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'custom';
  pointValue: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  dueDate?: FirebaseFirestoreTypes.Timestamp;
  completed: boolean;
  rules: string[]; // Conditions or steps
  userId: string; // Reference to the user
};

// 🛒 Redemption Record embedded into Task module
export type Redemption = {
  userId: string;
  itemId: string;
  itemName: string;
  redeemedAt: FirebaseFirestoreTypes.Timestamp;
  pointsUsed: number;
};
