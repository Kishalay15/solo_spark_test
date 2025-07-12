import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { ShopItem } from "../types/shopItem.types";
import userService from "../services/userServices";

interface ShopItemDetailsProps {
  item: ShopItem;
  visible: boolean;
  onClose: () => void;
  onRedeemSuccess: () => void;
}

export default function ShopItemDetails({ item, visible, onClose, onRedeemSuccess }: ShopItemDetailsProps) {
  const [userPoints, setUserPoints] = useState(0);
  const dummyUserId = "seed-user-123"; // Replace with actual user ID logic

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const userProfile = await userService.fetchUserProfile(dummyUserId);
        if (userProfile) {
          setUserPoints(userProfile.currentPoints);
        }
      } catch (error) {
        console.error("Error fetching user points:", error);
        Alert.alert("Error", "Failed to fetch user points.");
      }
    };

    if (visible) {
      fetchUserPoints();
    }
  }, [visible]);

  const handleRedeem = async () => {
    if (userPoints < item.pointCost) {
      Alert.alert("Insufficient Points", "You don't have enough points to redeem this item.");
      return;
    }

    try {
      await userService.deductPoints(dummyUserId, item.pointCost);
      Alert.alert("Success", `You have redeemed ${item.name} for ${item.pointCost} points!`);
      onRedeemSuccess();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", `Failed to redeem item: ${error.message}`);
      } else {
        Alert.alert("Error", "Failed to redeem item.");
      }
    }
  };

  if (!visible) return null;

  const canRedeem = userPoints >= item.pointCost;

  return (
    <View className="absolute inset-0 flex-1 justify-center items-center bg-black/50">
      <View className="m-5 bg-white rounded-2xl p-9 items-center shadow-lg">
        <Text className="text-2xl font-bold mb-2">{item.name}</Text>
        <Text className="text-base mb-2">{item.description}</Text>
        <Text className="text-sm italic mb-2">Type: {item.type}</Text>
        <Text className="text-base font-bold mb-5">Cost: {item.pointCost} points</Text>
        <Text className="text-base mb-5">Your Points: {userPoints}</Text>

        <Pressable
          className={`rounded-xl p-2.5 elevation-2 ${canRedeem ? "bg-green-500" : "bg-gray-400"}`}
          onPress={handleRedeem}
          disabled={!canRedeem}
        >
          <Text className="text-white font-bold text-center">{canRedeem ? "Redeem" : "Insufficient Points"}</Text>
        </Pressable>

        <Pressable
          className="rounded-xl p-2.5 elevation-2 bg-blue-500 mt-4"
          onPress={onClose}
        >
          <Text className="text-white font-bold text-center">Close</Text>
        </Pressable>
      </View>
    </View>
  );
}
