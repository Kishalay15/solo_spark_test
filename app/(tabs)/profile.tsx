import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { AnalyticsUserProfile } from "../../services/analyticsServices.types";
import { Metrics } from "../../types/user.types";
import userService from "@/services/userServices";
import firestore from "@react-native-firebase/firestore";

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState<AnalyticsUserProfile | null>(
    null
  );
  const [userMetrics, setUserMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dummyUserId = "seed-user-123"; // Use the same dummy ID as in seedFirebase.ts

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.fetchUserProfile(dummyUserId);
        const metricsDoc = await firestore()
          .collection("solo_spark_user")
          .doc(dummyUserId)
          .collection("metrics")
          .doc("summary")
          .get();

        if (profile) {
          setUserProfile(profile);
        } else {
          setError("User profile not found.");
        }

        if (metricsDoc.exists()) {
          setUserMetrics(metricsDoc.data() as Metrics);
        }
      } catch (err) {
        console.error("Error fetching user profile or metrics:", err);
        setError("Failed to load user profile or metrics.");
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
      <Text className="text-3xl font-bold mb-5 text-center text-gray-800">
        User Profile
      </Text>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Display Name:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.displayName}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Email:
        </Text>
        <Text className="text-base text-gray-800">{userProfile.email}</Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Phone Number:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.phoneNumber || "N/A"}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Current Points:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.currentPoints}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Compatibility Score:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.compatibilityScore}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Privacy Level:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.privacyLevel}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Profile Created At:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.profileCreatedAt?.toDate().toLocaleString() || "N/A"}
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
        <Text className="text-base font-semibold text-gray-600 mb-1">
          Profile Updated At:
        </Text>
        <Text className="text-base text-gray-800">
          {userProfile.lastUpdatedAt?.toDate().toLocaleString() || "N/A"}
        </Text>
      </View>
      {userProfile.emotionalProfile && (
        <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
          <Text className="text-base font-semibold text-gray-600 mb-1">
            Emotional Needs:
          </Text>
          <Text className="text-base text-gray-800">
            {" "}
            {userProfile.emotionalProfile.emotionalNeeds}
          </Text>
        </View>
      )}
      {userMetrics && userMetrics.emotionalProfileMetrics && (
        <View className="bg-white rounded-lg p-4 mb-3 shadow-md">
          <Text className="text-base font-semibold text-gray-600 mb-1">
            Emotional Profile Metrics:
          </Text>
          <Text className="text-base text-gray-800">
            {" "}
            Current Mood: {userMetrics.emotionalProfileMetrics.currentMood}
          </Text>
          <Text className="text-base text-gray-800">
            {" "}
            Mood Frequency: {userMetrics.emotionalProfileMetrics.moodFrequency}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;
