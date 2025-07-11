import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  CreateMoodState,
  CreatePersonalityTrait,
  CreatePointsTransaction,
  CreateUser,
  MoodState,
  PersonalityTrait,
  PointsTransaction,
  QuestResponse,
  User,
  traitScore,
  UserSettings,
} from "./userServices.types";
import { CreateQuest, CreateQuestResponse, Quest } from "./questServices.types";
import _logError from "@/utils/logErrors";
import questService from "./questServices";
import {
  AnalyticsMoodEntry,
  AnalyticsPersonalityTrait,
  AnalyticsUserProfile,
} from "./analyticsServices.types";

class UserService {
  private getCurrentUserId(userId?: string): string {
    return userId || "seed-user-123";
  }

  // private _logError(error: unknown, message: string): void {
  //   const errorMessage =
  //     error instanceof Error ? error.message : "Unknown error";
  //   const errorCode = (error as any)?.code || "Unknown";
  //   const errorStack = error instanceof Error ? error.stack : "No stack trace";
  //   console.error(`❌ ${message}:`, {
  //     message: errorMessage,
  //     code: errorCode,
  //     stack: errorStack,
  //     originalError: error,
  //   });
  // }

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

  async fetchUserProfile(userId: string): Promise<AnalyticsUserProfile | null> {
    try {
      const currentUserId = this.getCurrentUserId(userId);
      const userDoc = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .get();

      if (userDoc.exists()) {
        const userData = userDoc.data() as AnalyticsUserProfile;
        console.log("✅ Fetched user profile");
        return userData;
      } else {
        console.log("❌ User profile not found");
        return null;
      }
    } catch (error) {
      _logError(error, "Error fetching user profile");
      throw error;
    }
  }

  async fetchPersonalityTraits(
    userId: string
  ): Promise<AnalyticsPersonalityTrait[]> {
    const rawTraits = await this.fetchCollection<
      PersonalityTrait & {
        id: string;
        timestamp: FirebaseFirestoreTypes.Timestamp;
      }
    >(userId, "PersonalityTraits", { field: "timestamp", direction: "desc" });

    // Map raw traits (with traitScore) to AnalyticsPersonalityTrait (with numbers)
    return rawTraits.map((trait) => ({
      id: trait.id,
      openness: trait.openness.value * trait.openness.weight * 10, // Scale 0-1 to 1-10
      neuroticism: trait.neuroticism.value * trait.neuroticism.weight * 10, // Scale 0-1 to 1-10
      agreeableness:
        trait.agreeableness.value * trait.agreeableness.weight * 10, // Scale 0-1 to 1-10
      timestamp: trait.timestamp,
    }));
  }

  async fetchMoodEntries(userId: string): Promise<AnalyticsMoodEntry[]> {
    return this.fetchCollection<AnalyticsMoodEntry>(userId, "MoodHistory", {
      field: "timestamp",
      direction: "desc",
    });
  }

  private async _createUser(
    userId: string,
    userData: CreateUser
  ): Promise<void> {
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
        emotionalNeeds: ["Support"],
      },
    };

    await firestore()
      .collection("solo_spark_user")
      .doc(userId)
      .set(userProfileData);
    console.log("✅ Real Firebase: User profile created successfully!");
    console.log("📊 Saved data:", userProfileData);
  }

  private async _updateUser(
    userId: string,
    userData: Partial<CreateUser>
  ): Promise<void> {
    const userProfileData = {
      ...userData,
      lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore()
      .collection("solo_spark_user")
      .doc(userId)
      .update(userProfileData);
    console.log("✅ Real Firebase: User profile updated successfully!");
    console.log("📊 Updated data:", userProfileData);
  }

  async saveUserProfile(userId: string, userData: CreateUser): Promise<void> {
    try {
      console.log("🔥 Starting Firebase save...");
      const currentUserId = this.getCurrentUserId(userId);
      console.log("👤 User ID:", currentUserId);

      const userDoc = await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .get();

      if (userDoc.exists()) {
        console.log("📝 Attempting to update existing user in Firebase...");
        await this._updateUser(currentUserId, userData);
      } else {
        console.log("📝 Attempting to create new user in Firebase...");
        await this._createUser(currentUserId, userData);
      }
    } catch (error) {
      _logError(error, "Firebase Error in saveUserProfile");
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
      _logError(error, "Firebase Error in savePersonalityTrait");
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
      _logError(error, "Firebase Error in saveMoodEntry");
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
        ...(transactionData.expiryDate && {
          expiryDate: transactionData.expiryDate,
        }),
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
      _logError(error, "Firebase Error in savePointsTransaction");
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
      const questId = await questService.saveQuest({
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
      await questService.saveQuestResponse(userId, {
        questId: questId,
        response: "A. Take deep breaths",
      });

      console.log("✅ Complete user profile created successfully!");
    } catch (error) {
      _logError(error, "Error creating complete profile");
      throw error;
    }
  }

  private async _deleteCollection(
    collectionRef: FirebaseFirestoreTypes.CollectionReference
  ): Promise<void> {
    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
      return;
    }

    const batch = firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  async _deleteUser(userId: string): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId(userId);
      const userRef = firestore()
        .collection("solo_spark_user")
        .doc(currentUserId);
      const subcollections = [
        "PersonalityTraits",
        "MoodHistory",
        "PointsTransactions",
        "QuestResponses",
        "Metrics",
      ];

      for (const subcollection of subcollections) {
        const subcollectionRef = userRef.collection(subcollection);
        await this._deleteCollection(subcollectionRef);
        console.log(`🗑️ Subcollection ${subcollection} deleted successfully`);
      }

      await userRef.delete();
      console.log("🗑️ User document deleted successfully");
    } catch (err) {
      _logError(err, "Failed to delete user");
      throw err;
    }
  }
}

const userService = new UserService();

export default userService;
