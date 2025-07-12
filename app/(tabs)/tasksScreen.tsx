import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import taskService from "../../services/taskServices";
import { DisplayTask } from "../../types/tasksScreen.types";
import TaskDetails from "../../components/taskDetails";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<DisplayTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<DisplayTask | null>(null);

  const dummyUserId = "seed-user-123";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasksByUser(dummyUserId);
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
      Alert.alert("Error", "Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePressTask = (task: DisplayTask) => {
    console.log("Selected Task:", task);
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-500">Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-base text-center">{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: DisplayTask }) => (
    <TouchableOpacity onPress={() => handlePressTask(item)} className="mb-4">
      <View className="bg-white p-4 rounded-lg shadow">
        <Text className="text-lg font-bold">{item.title}</Text>
        <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
        <Text className="text-xs text-gray-500 italic mt-1">
          Category: {item.category}
        </Text>
        <Text className="text-base font-bold text-green-600 mt-1">
          Points: {item.pointValue}
        </Text>
        <Text className="text-sm text-blue-600 mt-1">
          Status: {item.completed ? "Completed" : "Uncompleted"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold mb-5 text-center">
        Available Tasks
      </Text>
      {tasks.length === 0 ? (
        <Text className="text-center mt-10 text-gray-600">
          No tasks found for this user.
        </Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.title}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          visible={!!selectedTask}
          onClose={handleCloseModal}
          onTaskUpdated={fetchTasks}
        />
      )}
    </View>
  );
}
