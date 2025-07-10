import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "../global.css";

console.log("✅ Firebase .");

export default function RootLayout() {
  return (
    <View className="flex-1">
      <StatusBar />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
      </Stack>
    </View>
  );
}
