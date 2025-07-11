import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type ShopItem = {
  name: string;
  description: string;
  pointCost: number;
  type: "digital" | "physical" | "badge";
  stock: number;
  available: boolean;
  imageUrl?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
};
