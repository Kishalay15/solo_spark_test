import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import seedFirebase from "../../services/seedFirebase";

const IndexScreen = () => {
  const router = useRouter();
  const handleSeedFirebase = async () => {
    try {
      await seedFirebase();
      Alert.alert("Success", "Firebase seeding completed!");
    } catch (error) {
      console.error("Error seeding Firebase:", error);
      Alert.alert(
        "Error",
        "Failed to seed Firebase. Check console for details."
      );
    }
  };

  const handleGoToProfile = () => {
    router.push("/profile"); // Navigate to the profile tab
  };

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-5">Firebase Seeding</Text>
      <Button title="Seed Firebase" onPress={handleSeedFirebase} />
      <View style={{ marginTop: 20 }}>
        <Button title="Go to Profile" onPress={handleGoToProfile} />
      </View>
    </View>
  );
};

export default IndexScreen;
