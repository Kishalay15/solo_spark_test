import firestore from "@react-native-firebase/firestore";
import { ShopItem } from "../types/shopItem.types";
import { CreateShopItemData, UpdateShopItemData, ShopItemResponse } from "./shopService.types";
import _logError from "@/utils/logErrors";

const SHOP_COLLECTION = "solo_spark_shop";

class ShopService {
  private shopRef = firestore().collection(SHOP_COLLECTION);

  async createShopItem(data: CreateShopItemData): Promise<void> {
    try {
      const newItem = {
        ...data,
        available: data.stock > 0, // Set available based on stock
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      await this.shopRef.add(newItem);
      console.log("✅ Reward item added to shop");
    } catch (err) {
      _logError(err, "Failed to create reward item");
      throw err;
    }
  }

  async getAllShopItems(): Promise<ShopItemResponse> {
    try {
      const snapshot = await this.shopRef.get();
      return snapshot.docs.map((doc) => doc.data() as ShopItem);
    } catch (err) {
      _logError(err, "Failed to fetch rewards");
      throw err;
    }
  }

  async updateShopItem(
    shopItemId: string,
    updates: UpdateShopItemData
  ): Promise<void> {
    try {
      await this.shopRef.doc(shopItemId).update(updates);
      console.log("✅ Reward item updated");
    } catch (err) {
      _logError(err, "Failed to update reward item");
      throw err;
    }
  }

  async deleteShopItem(shopItemId: string): Promise<void> {
    try {
      await this.shopRef.doc(shopItemId).delete();
      console.log("🗑️ Reward item deleted");
    } catch (err) {
      _logError(err, "Failed to delete reward item");
      throw err;
    }
  }
}

const shopService = new ShopService();

export default shopService;