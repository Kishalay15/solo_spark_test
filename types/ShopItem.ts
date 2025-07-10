import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ShopItem = {
  name: string;
  description: string;
  pointCost: number;
  type: 'digital' | 'physical' | 'badge'; // 🆕 Type added for classification
  stock?: number;                         // Optional: if not present, assume unlimited
  available: boolean;                     // 🆕 Shop item visibility
  imageUrl?: string;                      // 🆕 Optional item preview
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp; // 🆕 Track last update
};
