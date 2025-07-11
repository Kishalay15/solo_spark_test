import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import questService from "../../services/questServices"; // Adjust path as needed
import { AnalyticsQuest } from "../../services/analyticsServices.types"; // To type the fetched quest
import { CreateQuestResponse } from "../../services/questServices.types"; // To type the response data
import firestore from "@react-native-firebase/firestore";
import { Metrics } from "../../types/user.types";

const QuestScreen = () => {
  const [quest, setQuest] = useState<AnalyticsQuest | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResponded, setHasResponded] = useState(false);

  //hardcoded
  const dummyQuestId = "zJ7H9HiWdvsij2QrlW9V";
  const dummyUserId = "seed-user-123";

  useEffect(() => {
    const fetchQuestAndMetrics = async () => {
      try {
        setLoading(true);
        const fetchedQuest = await questService.fetchQuestById(dummyQuestId);
        const metricsDoc = await firestore()
          .collection("solo_spark_user")
          .doc(dummyUserId)
          .collection("metrics")
          .doc("summary")
          .get();

        if (fetchedQuest) {
          setQuest(fetchedQuest);
          if (metricsDoc.exists()) {
            const metrics = metricsDoc.data() as Metrics;
            if (
              metrics.engagementProfile.completedQuests.includes(
                fetchedQuest.id
              )
            ) {
              setHasResponded(true);
            }
          }
        } else {
          setError("Quest not found.");
        }
      } catch (err) {
        console.error("Error fetching quest or metrics:", err);
        setError("Failed to load quest.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestAndMetrics();
  }, []);

  const handleSubmit = async () => {
    if (!quest || !selectedOption) {
      Alert.alert("Validation Error", "Please select an option.");
      return;
    }

    try {
      setSubmitting(true);
      const responseData: CreateQuestResponse = {
        questId: quest.id,
        response: selectedOption,
      };
      await questService.saveQuestResponse(dummyUserId, responseData);
      Alert.alert("Success", "Your answer has been submitted!");
      setHasResponded(true); // Mark as responded after successful submission
      setSelectedOption(null); // Clear selection after submission
    } catch (err) {
      console.error("Error submitting answer:", err);
      Alert.alert(
        "Submission Failed",
        "Could not submit your answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-700">Loading quest...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-red-500 text-base">{error}</Text>
      </View>
    );
  }

  if (!quest) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-700">No quest data available.</Text>
      </View>
    );
  }

  if (hasResponded) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-5">
        <Text className="text-xl font-bold text-gray-700">
          Already Responded
        </Text>
        <Text className="text-base text-gray-600 mt-2 text-center">
          You have already submitted your answer for this quest.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold mb-5 text-center text-gray-800">
        Quest Time!
      </Text>

      <View className="bg-white rounded-lg p-4 mb-5 shadow-md">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          {quest.questionText}
        </Text>
        {quest.options && quest.options.length > 0 && (
          <View className="mb-3">
            <Text className="text-base font-medium text-gray-600 mb-1">
              Choose an option:
            </Text>
            {quest.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center p-3 mb-2 rounded-md border ${selectedOption === option ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-gray-50"}`}
                onPress={() => setSelectedOption(option)}
                disabled={submitting}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 ${selectedOption === option ? "border-blue-500 bg-blue-500" : "border-gray-400"} mr-3`}
                />
                <Text className="text-base text-gray-800 flex-1">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text className="text-sm text-gray-500">
          Category: {quest.category}
        </Text>
        <Text className="text-sm text-gray-500">
          Points: {quest.pointValue}
        </Text>
      </View>

      <TouchableOpacity
        className={`py-3 rounded-md ${submitting || !selectedOption ? "bg-blue-300" : "bg-blue-500"}`}
        onPress={handleSubmit}
        disabled={submitting || !selectedOption}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            Submit Answer
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default QuestScreen;
