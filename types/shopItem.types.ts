import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type ShopItem = {
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
};
