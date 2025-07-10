import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Reward = {
  name: string;
  description: string;
  type: "digital" | "physical" | "badge";
  cost: number;
  imageUrl?: string;
  stock?: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  available: boolean;
};

export type Redemption = {
  userId: string;
  itemId: string;
  itemName: string;
  pointsUsed: number;
  redeemedAt: FirebaseFirestoreTypes.Timestamp;
  redeemedVia: "taskCompletion" | "shop";
  rewardType: Reward["type"];
  status: "pending" | "approved" | "rejected";
  processedAt?: FirebaseFirestoreTypes.Timestamp;
};


