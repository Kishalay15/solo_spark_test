import firestore from "@react-native-firebase/firestore";
import {
  CreateMoodState,
  CreatePersonalityTrait,
  CreatePointsTransaction,
  CreateQuest,
  CreateQuestResponse,
  CreateUser,
  MoodState,
  PersonalityTrait,
  PointsTransaction,
  Quest,
  QuestResponse,
  User,
  traitScore,
  UserSettings,
} from "./firebaseServices.types";

class FirebaseService {
  private getCurrentUserId(userId?: string): string {
    return userId || "seed-user-123";
  }

  private _logError(error: unknown, message: string): void {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode = (error as any)?.code || "Unknown";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    console.error(`❌ ${message}:`, {
      message: errorMessage,
      code: errorCode,
      stack: errorStack,
      originalError: error,
    });
  }

  async saveUserProfile(userId: string, userData: CreateUser): Promise<void> {
    try {
      console.log("🔥 Starting Firebase save...");
      console.log("📊 User data to save:", userData);

      const currentUserId = this.getCurrentUserId(userId);
      console.log("👤 User ID:", currentUserId);

      // Create the user profile with proper structure
      const userProfileData = {
        email: userData.email || "test@example.com",
        displayName: userData.displayName || "Test User",
        profileCreatedAt: firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        compatibilityScore: userData.compatibilityScore || 85,
        currentPoints: userData.currentPoints || 100,
        privacyLevel: userData.privacyLevel || "private",
        phoneNumber: userData.phoneNumber || "",
        emotionalProfile: userData.emotionalProfile || {
          currentMood: "Neutral",
          moodFrequency: "Stable",
          emotionalNeeds: "Support",
        },
      };

      console.log("📝 Attempting to save to Firebase...");
      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .set(userProfileData);

      console.log("✅ Real Firebase: User profile saved successfully!");
      console.log("📊 Saved data:", userProfileData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as any)?.code || "Unknown";
      const errorStack =
        error instanceof Error ? error.stack : "No stack trace";
      this._logError(error, "Firebase Error in saveUserProfile");
      throw error;
    }
  }

  async savePersonalityTrait(
    userId: string,
    traitData: CreatePersonalityTrait
  ): Promise<string> {
    try {
      const currentUserId = this.getCurrentUserId(userId);

      // Basic runtime validation for personality traits
      const validateTrait = (
        trait: { value?: number; weight?: number },
        name: string
      ) => {
        if (
          trait.value === undefined ||
          typeof trait.value !== "number" ||
          trait.value < 0 ||
          trait.value > 1
        ) {
          throw new Error(`${name} value must be a number between 0 and 1.`);
        }
      };

      if (traitData.openness) validateTrait(traitData.openness, "Openness");
      if (traitData.neuroticism)
        validateTrait(traitData.neuroticism, "Neuroticism");
      if (traitData.agreeableness)
        validateTrait(traitData.agreeableness, "Agreeableness");

      // Create personality trait with proper structure
      const traitWithTimestamp = {
        openness: traitData.openness || { value: 0.5, weight: 1 },
        neuroticism: traitData.neuroticism || { value: 0.3, weight: 1 },
        agreeableness: traitData.agreeableness || { value: 0.7, weight: 1 },
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .collection("PersonalityTraits")
        .add(traitWithTimestamp);

      console.log(
        "✅ Real Firebase: Personality trait saved successfully",
        traitWithTimestamp
      );
      return docRef.id;
    } catch (error) {
      this._logError(error, "Firebase Error in savePersonalityTrait");
      throw error;
    }
  }

  async saveMoodEntry(
    userId: string,
    moodData: CreateMoodState
  ): Promise<string> {
    try {
      const currentUserId = this.getCurrentUserId(userId);

      // Basic runtime validation for mood entry
      if (!moodData.state || moodData.state.trim() === "") {
        throw new Error("Mood state cannot be empty.");
      }
      if (
        moodData.intensity === undefined ||
        typeof moodData.intensity !== "number" ||
        moodData.intensity < 1 ||
        moodData.intensity > 10
      ) {
        throw new Error("Mood intensity must be a number between 1 and 10.");
      }

      // Create mood entry with proper structure
      const moodWithTimestamp = {
        state: moodData.state || "Happy",
        intensity: moodData.intensity || 5,
        trigger: moodData.trigger || "",
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .collection("MoodHistory")
        .add(moodWithTimestamp);

      console.log(
        "✅ Real Firebase: Mood entry saved successfully",
        moodWithTimestamp
      );
      return docRef.id;
    } catch (error) {
      this._logError(error, "Firebase Error in saveMoodEntry");
      throw error;
    }
  }

  async savePointsTransaction(
    userId: string,
    transactionData: CreatePointsTransaction
  ): Promise<string> {
    try {
      const currentUserId = this.getCurrentUserId(userId);

      // Basic runtime validation for points transaction
      if (
        transactionData.amount === undefined ||
        typeof transactionData.amount !== "number" ||
        transactionData.amount <= 0
      ) {
        throw new Error("Transaction amount must be a positive number.");
      }
      if (
        transactionData.type &&
        !["earned", "bonus"].includes(transactionData.type)
      ) {
        throw new Error("Transaction type must be 'earned' or 'bonus'.");
      }

      // Create points transaction with proper structure
      const transactionWithTimestamp = {
        amount: transactionData.amount || 10,
        type: transactionData.type || "earned", // 'earned' | 'bonus'
        reason: transactionData.reason || "Test transaction",
        timestamp: firestore.FieldValue.serverTimestamp(),
        ...(transactionData.expiryDate && { expiryDate: transactionData.expiryDate }),
      };

      const docRef = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .collection("PointsTransactions")
        .add(transactionWithTimestamp);

      // Update user's total points
      const userDoc = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .get();
      const currentPoints = userDoc.data()?.currentPoints || 0;

      const newTotalPoints =
        transactionWithTimestamp.type === "earned"
          ? currentPoints + transactionWithTimestamp.amount
          : currentPoints + transactionWithTimestamp.amount; // 'bonus' also adds points

      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .update({
          currentPoints: Math.max(0, newTotalPoints),
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        "✅ Real Firebase: Points transaction saved successfully",
        transactionWithTimestamp
      );
      return docRef.id;
    } catch (error) {
      this._logError(error, "Firebase Error in savePointsTransaction");
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
      return docRef.id;
    } catch (error) {
      this._logError(error, "Firebase Error in saveQuestResponse");
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
      this._logError(error, "Firebase Error in saveQuest");
      throw error;
    }
  }

  // Method to create a complete user profile with all subcollections
  async createCompleteUserProfile(userId: string): Promise<void> {
    try {
      console.log("🔥 Creating complete user profile with subcollections...");

      // First, create the main user profile
      await this.saveUserProfile(userId, {
        email: "complete@example.com",
        displayName: "Complete User",
        compatibilityScore: 92,
        currentPoints: 250,
        privacyLevel: "public",
        phoneNumber: "+1234567890",
      });

      // Create personality traits
      await this.savePersonalityTrait(userId, {
        openness: { value: 0.8, weight: 1 },
        neuroticism: { value: 0.2, weight: 1 },
        agreeableness: { value: 0.9, weight: 1 },
      });

      // Create mood entries
      await this.saveMoodEntry(userId, {
        state: "Happy",
        intensity: 7,
        trigger: "Good weather",
      });

      await this.saveMoodEntry(userId, {
        state: "Calm",
        intensity: 6,
        trigger: "Meditation",
      });

      // Create points transactions
      await this.savePointsTransaction(userId, {
        amount: 50,
        type: "earned",
        reason: "Completed daily quest",
      });

      await this.savePointsTransaction(userId, {
        amount: 20,
        type: "bonus",
        reason: "Referral bonus",
      });

      // Create a quest first
      const questId = await this.saveQuest({
        questionText: "What would you do when feeling stressed?",
        category: "growth",
        options: [
          "A. Take deep breaths",
          "B. Go for a walk",
          "C. Talk to someone",
        ],
        pointValue: 15,
        responseOptions: ["A", "B", "C"],
        responseCount: 0,
      });

      // Create quest response
      await this.saveQuestResponse(userId, {
        questId: questId,
        response: "A. Take deep breaths",
      });

      console.log("✅ Complete user profile created successfully!");
    } catch (error) {
      this._logError(error, "Error creating complete profile");
      throw error;
    }
  }
}

const firebaseService = new FirebaseService();

export default firebaseService;
