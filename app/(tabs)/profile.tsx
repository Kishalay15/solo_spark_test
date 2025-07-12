import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import analyticsService from "../../services/analyticsServices";
import { AnalyticsUserProfile } from "../../services/analyticsServices.types";

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState<AnalyticsUserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dummyUserId = "seed-user-123";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await analyticsService.fetchUserProfile(dummyUserId);
        if (profile) {
          setUserProfile(profile);
        } else {
          setError("User profile not found.");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-base">{error}</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No profile data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-5 text-center text-gray-800">User Profile</Text>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Display Name:</Text>
        <Text className="text-base text-gray-800">{userProfile.displayName}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Email:</Text>
        <Text className="text-base text-gray-800">{userProfile.email}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Phone Number:</Text>
        <Text className="text-base text-gray-800">{userProfile.phoneNumber || "N/A"}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Current Points:</Text>
        <Text className="text-base text-gray-800">{userProfile.currentPoints}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Compatibility Score:</Text>
        <Text className="text-base text-gray-800">{userProfile.compatibilityScore}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Privacy Level:</Text>
        <Text className="text-base text-gray-800">{userProfile.privacyLevel}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Profile Created At:</Text>
        <Text className="text-base text-gray-800">
          {userProfile.profileCreatedAt?.toDate().toLocaleString() || "N/A"}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">Last Updated At:</Text>
        <Text className="text-base text-gray-800">
          {userProfile.lastUpdatedAt?.toDate().toLocaleString() || "N/A"}
        </Text>
      </View>
      {userProfile.emotionalProfile && (
        <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
          <Text className="text-base font-semibold text-gray-600 mb-1">Emotional Profile:</Text>
          <Text className="text-base text-gray-800">
            {" "}Current Mood: {userProfile.emotionalProfile.currentMood}
          </Text>
          <Text className="text-base text-gray-800">
            {" "}Mood Frequency: {userProfile.emotionalProfile.moodFrequency}
          </Text>
          <Text className="text-base text-gray-800">
            {" "}Emotional Needs: {userProfile.emotionalProfile.emotionalNeeds}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;