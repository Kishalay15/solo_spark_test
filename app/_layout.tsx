import React from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "../global.css";

console.log("✅ Firebase .");

export default function RootLayout() {
  return (
    <View className="flex-1">
      <StatusBar />
      <Slot />
    </View>
  );
}
