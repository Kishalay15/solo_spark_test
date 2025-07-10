// types/ShopItem.ts

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ShopItem = {
  id?: string;
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
};
