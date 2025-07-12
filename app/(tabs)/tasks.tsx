import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import firebaseService from "../../services/firebaseServices";
import { Quest } from "../../services/firebaseServices.types";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tasks (quests) on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await firestore()
          .collection("solo_spark_quest")
          .get();

        const fetchedTasks: Quest[] = [];
        querySnapshot.forEach((doc) => {
          fetchedTasks.push({
            id: doc.id,
            ...doc.data(),
          } as Quest);
        });

        setTasks(fetchedTasks);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        Alert.alert("Error", `Failed to fetch tasks: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Handle task completion
  const handleCompleteTask = async (taskId: string, points: number) => {
    try {
      const userId = "seed-user-123";
      await firebaseService.savePointsTransaction(userId, {
        amount: points,
        type: "earned",
        reason: `Completed task: ${taskId}`,
      });

      Alert.alert("Success", "Task completed! Points awarded.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to complete task: ${errorMessage}`);
    }
  };

  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-5 text-center text-gray-800">Task List</Text>

      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-12">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-base text-gray-600 mt-2">Loading tasks...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <Text className="text-base text-gray-600 text-center mt-5 italic">No tasks available.</Text>
      ) : (
        tasks.map((task) => (
          <View key={task.id} className="bg-white rounded-lg p-4 mb-4 shadow-md">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-semibold text-gray-800 flex-1">{task.questionText}</Text>
              <Text className="text-sm text-blue-500 font-semibold">{task.pointValue} points</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-2">Category: {task.category}</Text>
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg items-center"
              onPress={() => handleCompleteTask(task.id!, task.pointValue)}
            >
              <Text className="text-white text-sm font-semibold">Complete Task</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default TaskList;