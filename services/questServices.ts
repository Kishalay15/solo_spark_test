import { CreateQuestResponse, CreateQuest } from "./questServices.types";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import _logError from "@/utils/logErrors";
import {
  AnalyticsQuest,
  AnalyticsQuestResponse,
} from "./analyticsServices.types";
import { Metrics } from "../types/user.types";
import analyticsService from "./analyticsServices";

class QuestService {
  private getCurrentUserId(userId?: string): string {
    return userId || "seed-user-123";
  }

  private async fetchCollection<T>(
    userId: string,
    collectionPath: string,
    orderBy?: { field: string; direction: "asc" | "desc" }
  ): Promise<T[]> {
    try {
      const currentUserId = this.getCurrentUserId(userId);
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      let query: FirebaseFirestoreTypes.Query = firestore().collection(
        `solo_spark_user/${currentUserId}/${collectionPath}`
      );

      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction);
      }

      const snapshot = await query.get();
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });

      console.log(`✅ Fetched ${items.length} items from ${collectionPath}`);
      return items;
    } catch (error) {
      _logError(error, `Error fetching collection ${collectionPath}`);
      throw error;
    }
  }

  async saveQuestResponse(
    userId: string,
    responseData: CreateQuestResponse
  ): Promise<string> {
    try {
      const currentUserId = this.getCurrentUserId(userId);

      // Create quest response with proper structure
      const responseWithTimestamp = {
        questId: responseData.questId || "quest-123",
        response: responseData.response || "Option A",
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .collection("QuestResponses")
        .add(responseWithTimestamp);

      console.log(
        "✅ Real Firebase: Quest response saved successfully",
        responseWithTimestamp
      );

      // Fetch quest details to get pointValue
      const completedQuest = await this.fetchQuestById(responseData.questId || "quest-123");
      const pointsEarned = completedQuest?.pointValue || 0;

      // Update user's currentPoints and compatibilityScore in the main user document
      const userRef = firestore().collection("solo_spark_user").doc(currentUserId);
      await userRef.update({
        currentPoints: firestore.FieldValue.increment(pointsEarned),
        lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ User currentPoints updated by ${pointsEarned}`);

      // Update user metrics
      const metricsRef = firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
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
            completedQuests: [
              ...currentMetrics.engagementProfile.completedQuests,
              responseData.questId || "quest-123",
            ],
          },
        };
        await metricsRef.update(updatedMetrics);
        console.log("✅ User metrics updated successfully");
      } else {
        // Create initial metrics document if it doesn't exist
        const initialMetrics: Metrics = {
          categoryAffinity: { growth: 0, social: 0 },
          engagementProfile: {
            interactionFrequency: 1,
            completedQuests: [responseData.questId || "quest-123"],
          },
          emotionalProfileMetrics: { currentMood: "", moodFrequency: "" },
        };
        await metricsRef.set(initialMetrics);
        console.log("✅ Initial user metrics created successfully");
      }

      // Run analytics to update mood and other derived metrics
      await analyticsService.analyzeAndUpdateUserSchema(currentUserId);

      return docRef.id;
    } catch (error) {
      _logError(error, "Firebase Error in saveQuestResponse");
      throw error;
    }
  }

  async saveQuest(questData: CreateQuest): Promise<string> {
    try {
      // Basic runtime validation
      if (
        questData.pointValue === undefined ||
        isNaN(questData.pointValue) ||
        questData.pointValue <= 0
      ) {
        throw new Error("Point value must be a positive number.");
      }
      if (
        !questData.options ||
        questData.options.filter((opt) => opt.trim() !== "").length < 2
      ) {
        throw new Error("At least two non-empty options are required.");
      }

      // Create quest with proper structure
      const questWithId = {
        questionText: questData.questionText || "How are you feeling today?",
        category: questData.category || "emotional intelligence",
        options: questData.options || ["A. Happy", "B. Sad", "C. Neutral"],
        pointValue: questData.pointValue || 10,
        createdAt: firestore.FieldValue.serverTimestamp(),
        responseOptions: questData.responseOptions || [],
        responseCount: questData.responseCount || 0,
      };

      const docRef = await firestore()
        .collection("solo_spark_quest")
        .add(questWithId);

      console.log("✅ Real Firebase: Quest saved successfully", questWithId);
      return docRef.id;
    } catch (error) {
      _logError(error, "Firebase Error in saveQuest");
      throw error;
    }
  }

  async fetchQuestById(questId: string): Promise<AnalyticsQuest | null> {
    try {
      const questDoc = await firestore()
        .collection("solo_spark_quest")
        .doc(questId)
        .get();

      if (questDoc.exists()) {
        const quest = {
          id: questDoc.id,
          ...questDoc.data(),
        } as AnalyticsQuest;
        console.log(`✅ Fetched quest: ${quest.questionText}`);
        return quest;
      } else {
        console.log(`❌ AnalyticsQuest not found: ${questId}`);
        return null;
      }
    } catch (error) {
      _logError(error, "Error fetching quest");
      throw error;
    }
  }

  async fetchQuestResponses(userId: string): Promise<AnalyticsQuestResponse[]> {
    return this.fetchCollection<AnalyticsQuestResponse>(
      userId,
      "QuestResponses",
      {
        field: "timestamp",
        direction: "desc",
      }
    );
  }
}

const questService = new QuestService();

export default questService;
