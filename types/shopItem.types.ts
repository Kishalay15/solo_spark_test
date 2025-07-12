import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type ShopItem = {
  id?: string;
  name: string;
  description: string;
  pointCost: number;
  type: "digital" | "physical" | "service";
  stock: number;
  available: boolean;
  imageUrl?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
};
