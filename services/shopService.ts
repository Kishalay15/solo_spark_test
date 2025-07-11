import firestore from "@react-native-firebase/firestore";
import { ShopItem } from "../types/shopItem.types";
import { CreateShopItemData, UpdateShopItemData, ShopItemResponse } from "./shopService.types";

const SHOP_COLLECTION = "solo_spark_shop";

export const createShopItem = async (data: CreateShopItemData) => {
  try {
    await firestore().collection(SHOP_COLLECTION).add(data);
    console.log("✅ Reward item added to shop");
  } catch (err) {
    console.error("❌ Failed to create reward item:", err);
    throw err;
  }
};

export const getAllShopItems = async (): Promise<ShopItemResponse> => {
  try {
    const snapshot = await firestore().collection(SHOP_COLLECTION).get();
    return snapshot.docs.map((doc) => doc.data() as ShopItem);
  } catch (err) {
    console.error("❌ Failed to fetch rewards:", err);
    throw err;
  }
};

export const updateShopItem = async (
  shopItemId: string,
  updates: UpdateShopItemData
) => {
  try {
    await firestore().collection(SHOP_COLLECTION).doc(shopItemId).update(updates);
    console.log("✅ Reward item updated");
  } catch (err) {
    console.error("❌ Failed to update reward item:", err);
    throw err;
  }
};

export const deleteShopItem = async (shopItemId: string) => {
  try {
    await firestore().collection(SHOP_COLLECTION).doc(shopItemId).delete();
    console.log("🗑️ Reward item deleted");
  } catch (err) {
    console.error("❌ Failed to delete reward item:", err);
    throw err;
  }
};
