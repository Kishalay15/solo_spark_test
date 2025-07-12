import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import shopService from "@/services/shopService";
import { ShopItem } from "../../types/shopItem.types";
import ShopItemDetails from "../../components/shopItemDetails";

export default function ShopScreen() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShopItem, setSelectedShopItem] = useState<ShopItem | null>(null);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const items = await shopService.getAllShopItems();
      setShopItems(items);
      setError(null);
    } catch (err) {
      console.error("Error fetching shop items:", err);
      setError("Failed to load shop items.");
      Alert.alert(
        "Error",
        "Failed to load shop items. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopItems();
  }, []);

  const handlePressShopItem = (item: ShopItem) => {
    setSelectedShopItem(item);
  };

  const handleCloseModal = () => {
    setSelectedShopItem(null);
    fetchShopItems(); // Re-fetch items after modal closes (for point updates)
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-700">Loading shop items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-base text-center">{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ShopItem }) => (
    <TouchableOpacity onPress={() => handlePressShopItem(item)} className="bg-white p-4 rounded-lg shadow-md mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-1">
        {item.name}
      </Text>
      <Text className="text-sm text-gray-600 mb-1">{item.description}</Text>
      <Text className="text-xs text-gray-500 italic">Type: {item.type}</Text>
      <Text className="text-base font-bold text-green-600 mt-1">
        Cost: {item.pointCost} points
      </Text>
      <Text className="text-sm text-blue-600 mt-1">Stock: {item.stock}</Text>
      <Text className="text-sm text-gray-500 mt-1">
        Available: {item.available ? "Yes" : "No"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold mb-5 text-center text-gray-800">
        Shop
      </Text>
      {shopItems.length === 0 ? (
        <Text className="text-center mt-12 text-base text-gray-600">
          No shop items found.
        </Text>
      ) : (
        <FlatList
          data={shopItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.name + item.pointCost}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {selectedShopItem && (
        <ShopItemDetails
          item={selectedShopItem}
          visible={!!selectedShopItem}
          onClose={handleCloseModal}
          onRedeemSuccess={fetchShopItems}
        />
      )}
    </View>
  );
}
