import firestore from "@react-native-firebase/firestore";
import { ShopItem } from "../types/shopItem.types";
import {
  CreateShopItemData,
  UpdateShopItemData,
  ShopItemResponse,
} from "./shopService.types";
import _logError from "@/utils/logErrors";

const SHOP_COLLECTION = "solo_spark_shop";

class ShopService {
  private shopRef = firestore().collection(SHOP_COLLECTION);

  async createShopItem(data: CreateShopItemData): Promise<void> {
    try {
      const newItem = {
        ...data,
        available: data.stock > 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (data.stock < 0) throw new Error("Stock must be >= 0");

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
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ShopItem),
      }));
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
      const docRef = this.shopRef.doc(shopItemId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) throw new Error("Shop item not found");

      const currentData = docSnapshot.data() as ShopItem;
      const newStock = currentData.stock - 1;
      console.log("newStock");

      if (newStock < 0) throw new Error("Stock is already 0, cannot redeem");

      const updatedFields = {
        ...updates,
        stock: newStock,
        available: newStock > 0,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await docRef.update(updatedFields);

      console.log("✅ Reward item stock updated after redemption");
    } catch (err) {
      _logError(err, "Failed to update reward item (stock)");
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

  async getShopItemById(shopItemId: string): Promise<ShopItem | null> {
    try {
      const doc = await this.shopRef.doc(shopItemId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...(doc.data() as ShopItem) };
    } catch (err) {
      _logError(err, "Failed to fetch single shop item");
      throw err;
    }
  }
}

const shopService = new ShopService();

export default shopService;
