import { ShopItem } from "../types/shopItem.types";

export type CreateShopItemData = {
  name: string;
  description: string;
  type: "digital" | "physical" | "service";
  pointCost: number;
  imageUrl: string;
  stock: number;
};
export type UpdateShopItemData = Partial<ShopItem>;
export type ShopItemResponse = ShopItem[];
