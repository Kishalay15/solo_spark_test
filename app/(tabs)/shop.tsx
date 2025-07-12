import React from "react";
import { View, Text, ScrollView } from "react-native";

interface Reward {
  id: string;
  name: string;
  points: number;
}

const Shop: React.FC = () => {
  const rewards: Reward[] = [
    { id: "1", name: "Profile Boost", points: 100 },
    { id: "2", name: "Premium Badge", points: 200 },
    { id: "3", name: "Exclusive Chat Theme", points: 150 },
    { id: "4", name: "Extra Quest Slot", points: 300 },
  ];

  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-5 text-center text-gray-800">Reward Shop</Text>

      {rewards.length === 0 ? (
        <Text className="text-base text-gray-600 text-center mt-5 italic">No rewards available.</Text>
      ) : (
        <View className="flex-row flex-wrap justify-between">
          {rewards.map((reward) => (
            <View
              key={reward.id}
              className="bg-white w-[48%] rounded-lg p-4 mb-4 shadow-md items-center"
            >
              <View className="w-24 h-24 bg-gray-300 rounded-lg justify-center items-center mb-2">
                <Text className="text-sm text-gray-600 italic">Image</Text>
              </View>
              <Text className="text-base font-semibold text-gray-800 text-center">{reward.name}</Text>
              <Text className="text-sm text-blue-500 mt-1">{reward.points} points</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default Shop;