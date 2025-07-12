import React from "react";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="questScreen" options={{ title: "Quest" }} />
      <Tabs.Screen name="demoScreen" options={{ title: "Demo" }} />
      <Tabs.Screen name="tasksScreen" options={{ title: "Tasks" }} />
      <Tabs.Screen name="shopScreen" options={{ title: "Shop" }} />
    </Tabs>
  );
}
