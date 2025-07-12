import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { DisplayTask } from "../types/tasksScreen.types";
import taskService from "../services/taskServices";

interface TaskDetailsProps {
  task: DisplayTask;
  visible: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskDetails({ task, visible, onClose, onTaskUpdated }: TaskDetailsProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  const handleCompletionToggle = async () => {
    try {
      await taskService.updateTaskCompletion(task.id, !isCompleted);
      setIsCompleted(!isCompleted);
      onClose();
      onTaskUpdated();
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", `Failed to update task completion status: ${error.message}`);
      } else {
        Alert.alert("Error", "Failed to update task completion status.");
      }
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 flex-1 justify-center items-center bg-black/50">
      <View className="m-5 bg-white rounded-2xl p-9 items-center shadow-lg">
        <Text className="text-2xl font-bold mb-2">{task.title}</Text>
        <Text className="text-base mb-2">{task.description}</Text>
        <Text className="text-sm italic mb-2">Category: {task.category}</Text>
        <Text className="text-base font-bold mb-5">Points: {task.pointValue}</Text>
        <Pressable className="flex-row items-center mb-5" onPress={isCompleted ? undefined : handleCompletionToggle}>
          <View className={`w-8 h-8 border-2 ${isCompleted ? "border-gray-400" : "border-black"} mr-2 justify-center items-center ${isCompleted ? "bg-gray-400" : ""}`}>
            {isCompleted && <Text className="text-white text-xl">✓</Text>}
          </View>
          <Text className={`text-lg ${isCompleted ? "text-gray-400" : ""}`}>Completed</Text>
        </Pressable>

        <Pressable
          className="rounded-xl p-2.5 elevation-2 bg-blue-500"
          onPress={onClose}
        >
          <Text className="text-white font-bold text-center">Close</Text>
        </Pressable>
      </View>
    </View>
  );
}
