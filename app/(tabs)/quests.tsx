import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import firebaseService from "../../services/firebaseServices";
import { Quest } from "../../services/firebaseServices.types";

const QuestResponse: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quests on mount
  useEffect(() => {
    const fetchQuests = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await firestore()
          .collection("solo_spark_quest")
          .get();

        const fetchedQuests: Quest[] = [];
        querySnapshot.forEach((doc) => {
          fetchedQuests.push({
            id: doc.id,
            ...doc.data(),
          } as Quest);
        });

        setQuests(fetchedQuests);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        Alert.alert("Error", `Failed to fetch quests: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuests();
  }, []);

  // Handle quest selection
  const handleSelectQuest = (questId: string) => {
    setSelectedQuestId(questId);
    setSelectedResponse("");
  };

  // Handle response selection
  const handleSelectResponse = (response: string) => {
    setSelectedResponse(response);
  };

  // Handle response submission
  const handleSubmit = async () => {
    if (!selectedQuestId || !selectedResponse) {
      Alert.alert("Error", "Please select a quest and a response.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = "seed-user-123";
      await firebaseService.saveQuestResponse(userId, {
        questId: selectedQuestId,
        response: selectedResponse,
      });

      await firestore()
        .collection("solo_spark_quest")
        .doc(selectedQuestId)
        .update({
          responseCount: firestore.FieldValue.increment(1),
        });

      Alert.alert("Success", "Response submitted successfully!", [
        { text: "OK", onPress: () => { setSelectedQuestId(null); setSelectedResponse(""); } },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to submit response: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-5 text-center text-gray-800">Respond to Quest</Text>

      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-12">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-base text-gray-600 mt-2">Loading quests...</Text>
        </View>
      ) : quests.length === 0 ? (
        <Text className="text-base text-gray-600 text-center mt-5 italic">No quests available.</Text>
      ) : (
        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-600 mb-2">Select a Quest *</Text>
          {quests.map((quest) => (
            <TouchableOpacity
              key={quest.id}
              className={`bg-gray-50 p-3 rounded-lg mb-2 border border-gray-300 ${selectedQuestId === quest.id ? "bg-blue-500 border-blue-500" : ""}`}
              onPress={() => handleSelectQuest(quest.id!)}
            >
              <Text
                className={`text-base ${selectedQuestId === quest.id ? "text-white font-semibold" : "text-gray-800"}`}
              >
                {quest.questionText} ({quest.pointValue} points)
              </Text>
            </TouchableOpacity>
          ))}

          {selectedQuestId && (
            <View className="mt-3">
              <Text className="text-base font-semibold text-gray-600 mb-2">Select a Response *</Text>
              {quests
                .find((q) => q.id === selectedQuestId)
                ?.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`bg-gray-50 p-3 rounded-lg mb-2 border border-gray-300 ${selectedResponse === option ? "bg-blue-500 border-blue-500" : ""}`}
                    onPress={() => handleSelectResponse(option)}
                  >
                    <Text
                      className={`text-base ${selectedResponse === option ? "text-white font-semibold" : "text-gray-800"}`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <TouchableOpacity
            className={`bg-blue-500 p-4 rounded-lg mt-3 items-center ${isSubmitting || !selectedResponse ? "bg-gray-400" : ""}`}
            onPress={handleSubmit}
            disabled={isSubmitting || !selectedResponse}
          >
            <Text className="text-white text-base font-semibold">
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default QuestResponse;