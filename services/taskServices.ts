import firestore from "@react-native-firebase/firestore";
import { CreateTask, UpdateTask } from "./taskServices.types";
import { Task } from "../types/task.types";
import { DisplayTask } from "@/types/tasksScreen.types";
import { Metrics } from "../types/user.types";
import analyticsService from "./analyticsServices";

class TaskService {
  private tasksRef = firestore().collection("solo_spark_tasks");

  async createTask(task: CreateTask): Promise<string | null> {
    try {
      const newTaskRef = await this.tasksRef.add({
        ...task,
        createdAt: firestore.FieldValue.serverTimestamp(),
        completed: false,
      });
      return newTaskRef.id;
    } catch (error) {
      console.error("❌ Error creating task:", error);
      return null;
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const doc = await this.tasksRef.doc(taskId).get();
      if (doc.exists()) {
        return { ...(doc.data() as Task) };
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching task:", error);
      return null;
    }
  }

  async updateTask(taskId: string, updatedData: UpdateTask): Promise<boolean> {
    try {
      await this.tasksRef.doc(taskId).update({
        ...updatedData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // If the task is being marked as completed, update user metrics
      if (updatedData.completed) {
        const taskDoc = await this.tasksRef.doc(taskId).get();
        const taskData = taskDoc.data() as Task;
        const userId = taskData.userId; // Assuming task has a userId field

        if (userId) {
          const metricsRef = firestore()
            .collection("solo_spark_user")
            .doc(userId)
            .collection("metrics")
            .doc("summary");

          const metricsDoc = await metricsRef.get();

          if (metricsDoc.exists()) {
            const currentMetrics = metricsDoc.data() as Metrics;
            const updatedMetrics: Metrics = {
              ...currentMetrics,
              engagementProfile: {
                ...currentMetrics.engagementProfile,
                interactionFrequency:
                  currentMetrics.engagementProfile.interactionFrequency + 1,
              },
            };
            await metricsRef.update(updatedMetrics);
            console.log(
              "✅ User metrics updated successfully after task completion"
            );
          } else {
            // Create initial metrics document if it doesn't exist
            const initialMetrics: Metrics = {
              categoryAffinity: { growth: 0, social: 0 },
              engagementProfile: {
                interactionFrequency: 1,
                completedQuests: [],
              },
              emotionalProfileMetrics: { currentMood: "", moodFrequency: "" },
            };
            await metricsRef.set(initialMetrics);
            console.log(
              "✅ Initial user metrics created successfully after task completion"
            );
          }

          // Update user's currentPoints in the main user document
          const userRef = firestore().collection("solo_spark_user").doc(userId);
          const taskPoints = taskData.pointValue || 0; // Assuming task has a pointValue field
          await userRef.update({
            currentPoints: firestore.FieldValue.increment(taskPoints),
            lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
          });
          console.log(
            `✅ User currentPoints updated by ${taskPoints} after task completion`
          );

          // Run analytics to update mood and other derived metrics
          await analyticsService.analyzeAndUpdateUserSchema(userId);
        }
      }

      return true;
    } catch (error) {
      console.error("❌ Error updating task:", error);
      return false;
    }
  }

  async updateTaskCompletion(
    taskId: string,
    completed: boolean
  ): Promise<boolean> {
    try {
      await this.tasksRef.doc(taskId).update({
        completed,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      if (completed) {
        const taskDoc = await this.tasksRef.doc(taskId).get();
        const taskData = taskDoc.data() as Task;
        const userId = taskData.userId;

        if (userId) {
          const userRef = firestore().collection("solo_spark_user").doc(userId);
          const taskPoints = taskData.pointValue || 0;
          await userRef.update({
            currentPoints: firestore.FieldValue.increment(taskPoints),
            lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
          });
          console.log(
            `✅ User currentPoints updated by ${taskPoints} after task completion`
          );

          // Optionally update metrics and run analytics
          const metricsRef = firestore()
            .collection("solo_spark_user")
            .doc(userId)
            .collection("metrics")
            .doc("summary");

          const metricsDoc = await metricsRef.get();

          if (metricsDoc.exists()) {
            const currentMetrics = metricsDoc.data() as Metrics;
            const updatedMetrics: Metrics = {
              ...currentMetrics,
              engagementProfile: {
                ...currentMetrics.engagementProfile,
                interactionFrequency:
                  currentMetrics.engagementProfile.interactionFrequency + 1,
              },
            };
            await metricsRef.update(updatedMetrics);
            console.log(
              "✅ User metrics updated successfully after task completion"
            );
          } else {
            const initialMetrics: Metrics = {
              categoryAffinity: { growth: 0, social: 0 },
              engagementProfile: {
                interactionFrequency: 1,
                completedQuests: [],
              },
              emotionalProfileMetrics: { currentMood: "", moodFrequency: "" },
            };
            await metricsRef.set(initialMetrics);
            console.log(
              "✅ Initial user metrics created successfully after task completion"
            );
          }
        }
      }
      return true;
    } catch (error) {
      console.error("❌ Error updating task completion:", error);
      return false;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await this.tasksRef.doc(taskId).delete();
      return true;
    } catch (error) {
      console.error("❌ Error deleting task:", error);
      return false;
    }
  }

  async getTasksByUser(userId: string): Promise<DisplayTask[]> {
    try {
      const snapshot = await this.tasksRef.where("userId", "==", userId).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Task),
      }));
    } catch (error) {
      console.error("❌ Error fetching user tasks:", error);
      return [];
    }
  }
}

const taskService = new TaskService();

export default taskService;
