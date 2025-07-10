import firestore, {
  FirebaseFirestoreTypes,
  where,
} from "@react-native-firebase/firestore";
import type {
  AnalyticsMoodEntry,
  AnalyticsPersonalityTrait,
  AnalyticsQuest,
  AnalyticsQuestResponse,
  AnalyticsUserProfile,
  MoodScore,
  PersonalityResponse,
  AnalysisResult,
  ResponsePatterns,
} from "./analyticsServices.types";
import type { PersonalityTrait, traitScore } from "./models.types";

import {
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
  EMOTIONAL_NEEDS_KEYWORDS,
  PERSONALITY_IMPACT_KEYWORDS,
} from "@/constants/analyticsKeywords";

class AnalyticsService {
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

  // Fetch user profile
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
      this._logError(error, "Error fetching user profile");
      throw error;
    }
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
      this._logError(error, `Error fetching collection ${collectionPath}`);
      throw error;
    }
  }

  // Fetch all personality traits for a user
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

  // Fetch all mood entries for a user
  async fetchMoodEntries(userId: string): Promise<AnalyticsMoodEntry[]> {
    return this.fetchCollection<AnalyticsMoodEntry>(userId, "MoodHistory", {
      field: "timestamp",
      direction: "desc",
    });
  }

  // Fetch all quest responses for a user
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

  // Fetch quest details by ID
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
      this._logError(error, "Error fetching quest");
      throw error;
    }
  }

  // Comprehensive analysis of quest responses and update user schema
  async analyzeAndUpdateUserSchema(userId: string): Promise<{
    personalityUpdated: boolean;
    moodUpdated: boolean;
    emotionalNeedsUpdated: boolean;
    compatibilityScoreUpdated: boolean;
  }> {
    try {
      console.log("🔄 Starting comprehensive user schema analysis...");

      const [responses, userProfile] = await Promise.all([
        this.fetchQuestResponses(userId),
        this.fetchUserProfile(userId),
      ]);

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const results = {
        personalityUpdated: false,
        moodUpdated: false,
        emotionalNeedsUpdated: false,
        compatibilityScoreUpdated: false,
      };

      // Analyze responses and calculate updates
      const analysis = await this.analyzeQuestResponses(responses);

      // Update personality traits
      if (
        analysis.personalityChanges.openness !== 0 ||
        analysis.personalityChanges.neuroticism !== 0 ||
        analysis.personalityChanges.agreeableness !== 0
      ) {
        await this.updatePersonalityTraits(userId, analysis.personalityChanges);
        results.personalityUpdated = true;
      }

      // Update mood with better logic and debugging
      console.log("🔍 Mood analysis:", {
        currentMood: userProfile.emotionalProfile.currentMood,
        newMoodTrend: analysis.moodTrend,
        moodScores: analysis.moodScores,
      });

      // More aggressive mood update logic
      const shouldUpdateMood =
        analysis.moodTrend !== userProfile.emotionalProfile.currentMood ||
        analysis.moodScores.positive > 0 ||
        analysis.moodScores.negative > 0 ||
        (analysis.moodTrend === "Positive" &&
          userProfile.emotionalProfile.currentMood !== "Positive") ||
        (analysis.moodTrend === "Negative" &&
          userProfile.emotionalProfile.currentMood !== "Negative");

      if (shouldUpdateMood) {
        await this.updateUserMood(userId, analysis.moodTrend);
        results.moodUpdated = true;
        console.log(
          "✅ Mood updated from",
          userProfile.emotionalProfile.currentMood,
          "to",
          analysis.moodTrend
        );
      } else {
        console.log("⏭️ Mood not updated - no significant change detected");
      }

      // Update emotional needs
      if (
        analysis.emotionalNeeds !== userProfile.emotionalProfile.emotionalNeeds
      ) {
        await this.updateEmotionalNeeds(userId, analysis.emotionalNeeds);
        results.emotionalNeedsUpdated = true;
      }

      // Update compatibility score
      const newCompatibilityScore = this.calculateCompatibilityScore(analysis);
      if (newCompatibilityScore !== userProfile.compatibilityScore) {
        await this.updateCompatibilityScore(userId, newCompatibilityScore);
        results.compatibilityScoreUpdated = true;
      }

      console.log("✅ User schema analysis completed:", results);
      return results;
    } catch (error) {
      this._logError(error, "Error in user schema analysis");
      throw error;
    }
  }

  // Analyze quest responses comprehensively
  private async analyzeQuestResponses(
    responses: AnalyticsQuestResponse[]
  ): Promise<AnalysisResult> {
    const questIds: string[] = responses.map((response) => response.questId);
    const quests: { [key: string]: AnalyticsQuest } = {};

    if (questIds.length > 0) {
      const questDocs = await firestore()
        .collection("solo_spark_quest")
        .where(firestore.FieldPath.documentId(), "in", questIds)
        .get();

      questDocs.forEach((doc) => {
        quests[doc.id] = { id: doc.id, ...doc.data() } as AnalyticsQuest;
      });
    }

    const personalityChanges = {
      openness: 0,
      neuroticism: 0,
      agreeableness: 0,
    };
    const moodScores = { positive: 0, negative: 0, neutral: 0 };
    const emotionalNeedsPatterns: ResponsePatterns = {};
    const responsePatterns: ResponsePatterns = {};

    for (const response of responses) {
      const quest = quests[response.questId];
      if (!quest) continue;

      // Analyze personality impact
      const personalityImpact = this.analyzePersonalityImpact(
        quest,
        response.response
      );
      personalityChanges.openness += personalityImpact.openness;
      personalityChanges.neuroticism += personalityImpact.neuroticism;
      personalityChanges.agreeableness += personalityImpact.agreeableness;

      // Analyze mood impact
      const moodImpact = this.analyzeMoodImpact(quest, response.response);
      moodScores[moodImpact]++;

      // Analyze emotional needs
      const emotionalNeed = this.analyzeEmotionalNeeds(
        quest,
        response.response
      );
      emotionalNeedsPatterns[emotionalNeed] =
        (emotionalNeedsPatterns[emotionalNeed] || 0) + 1;

      // Track response patterns
      const category = quest.category.toLowerCase();
      responsePatterns[category] = (responsePatterns[category] || 0) + 1;
    }

    // Determine mood trend
    let moodTrend = "Neutral";
    if (moodScores.positive > moodScores.negative) moodTrend = "Positive";
    else if (moodScores.negative > moodScores.positive) moodTrend = "Negative";

    // Determine dominant emotional need
    const dominantEmotionalNeed = Object.keys(emotionalNeedsPatterns).reduce(
      (a, b) => (emotionalNeedsPatterns[a] > emotionalNeedsPatterns[b] ? a : b),
      "Support"
    );

    return {
      personalityChanges,
      moodTrend,
      moodScores,
      emotionalNeeds: dominantEmotionalNeed,
      responsePatterns,
    };
  }

  // Update personality traits
  private async updatePersonalityTraits(
    userId: string,
    changes: PersonalityResponse
  ): Promise<void> {
    try {
      const currentTraits = await this.fetchPersonalityTraits(userId);
      const latestTrait = currentTraits[0] || {
        openness: 5,
        neuroticism: 5,
        agreeableness: 5,
      };

      // Calculate new values (clamp between 1-10)
      const newOpenness = Math.max(
        1,
        Math.min(10, latestTrait.openness + changes.openness)
      );
      const newNeuroticism = Math.max(
        1,
        Math.min(10, latestTrait.neuroticism + changes.neuroticism)
      );
      const newAgreeableness = Math.max(
        1,
        Math.min(10, latestTrait.agreeableness + changes.agreeableness)
      );

      const currentUserId = this.getCurrentUserId(userId);
      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .collection("PersonalityTraits")
        .add({
          openness: { value: newOpenness / 10, weight: 1 },
          neuroticism: { value: newNeuroticism / 10, weight: 1 },
          agreeableness: { value: newAgreeableness / 10, weight: 1 },
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      console.log("✅ Personality traits updated:", {
        openness: newOpenness,
        neuroticism: newNeuroticism,
        agreeableness: newAgreeableness,
      });
    } catch (error) {
      this._logError(error, "Error updating personality traits");
      throw error;
    }
  }

  // Update user mood in profile
  private async updateUserMood(userId: string, newMood: string): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId(userId);
      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .update({
          "emotionalProfile.currentMood": newMood,
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Also add to mood history
      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .collection("MoodHistory")
        .add({
          mood: newMood,
          notes: `Auto-updated based on quest response analysis`,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      console.log("✅ User mood updated:", newMood);
    } catch (error) {
      this._logError(error, "Error updating user mood");
      throw error;
    }
  }

  // Update emotional needs
  private async updateEmotionalNeeds(
    userId: string,
    newNeeds: string
  ): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId(userId);
      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .update({
          "emotionalProfile.emotionalNeeds": newNeeds,
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log("✅ Emotional needs updated:", newNeeds);
    } catch (error) {
      this._logError(error, "Error updating emotional needs");
      throw error;
    }
  }

  // Update compatibility score
  private async updateCompatibilityScore(
    userId: string,
    newScore: number
  ): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId(userId);
      await firestore()
        .collection("solo_spark_user")
        .doc(currentUserId)
        .update({
          compatibilityScore: newScore,
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log("✅ Compatibility score updated:", newScore);
    } catch (error) {
      this._logError(error, "Error updating compatibility score");
      throw error;
    }
  }

  // Calculate compatibility score based on personality and responses
  private calculateCompatibilityScore(analysis: AnalysisResult): number {
    const baseScore = 50;
    let score = baseScore;

    // Adjust based on personality balance
    const personalityBalance =
      Math.abs(analysis.personalityChanges.openness) +
      Math.abs(analysis.personalityChanges.agreeableness) -
      Math.abs(analysis.personalityChanges.neuroticism);
    score += personalityBalance * 5;

    // Adjust based on mood
    if (analysis.moodTrend === "Positive") score += 10;
    else if (analysis.moodTrend === "Negative") score -= 10;

    // Adjust based on response consistency
    const totalResponses = Object.values(analysis.responsePatterns).reduce(
      (a: number, b: number) => a + b,
      0
    );
    if (totalResponses > 5) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // Analyze how a quest response impacts personality traits
  private analyzePersonalityImpact(
    quest: AnalyticsQuest,
    response: string
  ): {
    openness: number;
    neuroticism: number;
    agreeableness: number;
  } {
    const changes = { openness: 0, neuroticism: 0, agreeableness: 0 };
    const responseLower = response.toLowerCase();

    // Enhanced analysis based on quest category and response content
    const categoryKeywords =
      PERSONALITY_IMPACT_KEYWORDS[
        quest.category.toLowerCase() as keyof typeof PERSONALITY_IMPACT_KEYWORDS
      ];

    if (categoryKeywords) {
      if (categoryKeywords?.agreeableness) {
        if (
          categoryKeywords.agreeableness.some((keyword: string) =>
            responseLower.includes(keyword)
          )
        ) {
          changes.agreeableness += 0.3; // Adjust as needed
        }
      }
      if (categoryKeywords?.openness) {
        if (
          categoryKeywords.openness.some((keyword: string) =>
            responseLower.includes(keyword)
          )
        ) {
          changes.openness += 0.2; // Adjust as needed
        }
      }
      if (categoryKeywords?.neuroticism) {
        if (
          categoryKeywords.neuroticism.some((keyword: string) =>
            responseLower.includes(keyword)
          )
        ) {
          changes.neuroticism -= 0.2; // Adjust as needed
        }
      }
    } else {
      // Default small positive impact for any response if no specific category match
      changes.openness += 0.1;
    }

    return changes;
  }

  // Analyze how a quest response impacts mood
  private analyzeMoodImpact(
    quest: AnalyticsQuest,
    response: string
  ): "positive" | "negative" | "neutral" {
    const positiveKeywords = POSITIVE_KEYWORDS;

    const negativeKeywords = NEGATIVE_KEYWORDS;

    const responseLower = response.toLowerCase();

    // Check for positive keywords (more sensitive)
    for (const keyword of POSITIVE_KEYWORDS) {
      if (responseLower.includes(keyword)) {
        console.log(
          "😊 Positive mood detected from keyword:",
          keyword,
          "in response:",
          response
        );
        return "positive";
      }
    }

    // Check for negative keywords (more sensitive)
    for (const keyword of NEGATIVE_KEYWORDS) {
      if (responseLower.includes(keyword)) {
        console.log(
          "😞 Negative mood detected from keyword:",
          keyword,
          "in response:",
          response
        );
        return "negative";
      }
    }

    // Also check quest category for mood hints
    if (
      quest.category.toLowerCase().includes("stress") ||
      quest.category.toLowerCase().includes("conflict") ||
      quest.category.toLowerCase().includes("problem")
    ) {
      console.log(
        "😞 Negative mood inferred from quest category:",
        quest.category
      );
      return "negative";
    }

    if (
      quest.category.toLowerCase().includes("joy") ||
      quest.category.toLowerCase().includes("success") ||
      quest.category.toLowerCase().includes("achievement")
    ) {
      console.log(
        "😊 Positive mood inferred from quest category:",
        quest.category
      );
      return "positive";
    }

    console.log("😐 Neutral mood for response:", response);
    return "neutral";
  }

  // Analyze emotional needs from quest responses
  private analyzeEmotionalNeeds(
    quest: AnalyticsQuest,
    response: string
  ): string {
    const responseLower = response.toLowerCase();

    for (const key in EMOTIONAL_NEEDS_KEYWORDS) {
      const keywords =
        EMOTIONAL_NEEDS_KEYWORDS[key as keyof typeof EMOTIONAL_NEEDS_KEYWORDS];
      if (keywords.some((keyword: string) => responseLower.includes(keyword))) {
        return key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
      }
    }
    return "Support"; // Default emotional need
  }

  // Get comprehensive analytics summary
  async getComprehensiveAnalytics(userId: string): Promise<{
    totalResponses: number;
    averagePersonality: {
      openness: number;
      neuroticism: number;
      agreeableness: number;
    };
    moodTrend: string;
    emotionalNeeds: string;
    compatibilityScore: number;
    recentActivity: string;
    responsePatterns: ResponsePatterns;
    userProfile: AnalyticsUserProfile | null;
  }> {
    try {
      const [responses, traits, moods, userProfile] = await Promise.all([
        this.fetchQuestResponses(userId),
        this.fetchPersonalityTraits(userId),
        this.fetchMoodEntries(userId),
        this.fetchUserProfile(userId),
      ]);

      // Calculate average personality traits
      const avgPersonality =
        traits.length > 0
          ? {
              openness:
                traits.reduce((sum, t) => sum + t.openness, 0) / traits.length,
              neuroticism:
                traits.reduce((sum, t) => sum + t.neuroticism, 0) /
                traits.length,
              agreeableness:
                traits.reduce((sum, t) => sum + t.agreeableness, 0) /
                traits.length,
            }
          : { openness: 5, neuroticism: 5, agreeableness: 5 };

      // Get mood trend
      const moodTrend = moods.length > 0 ? moods[0].mood : "Unknown";

      // Get emotional needs
      const emotionalNeeds =
        userProfile?.emotionalProfile?.emotionalNeeds || "Unknown";

      // Get compatibility score
      const compatibilityScore = userProfile?.compatibilityScore || 50;

      // Get recent activity
      const recentActivity =
        responses.length > 0
          ? `Last response: ${new Date(
              responses[0].timestamp?.toDate()
            ).toLocaleDateString()}`
          : "No recent activity";

      // Analyze response patterns
      const responsePatterns: ResponsePatterns = {};
      const recentResponses = responses.slice(0, 10); // Last 10 responses
      const questIdsToFetch = recentResponses.map(
        (response) => response.questId
      );

      const fetchedQuests: { [key: string]: AnalyticsQuest } = {};
      if (questIdsToFetch.length > 0) {
        const questDocs = await firestore()
          .collection("solo_spark_quest")
          .where(firestore.FieldPath.documentId(), "in", questIdsToFetch)
          .get();

        questDocs.forEach((doc) => {
          fetchedQuests[doc.id] = {
            id: doc.id,
            ...doc.data(),
          } as AnalyticsQuest;
        });
      }

      for (const response of recentResponses) {
        const quest = fetchedQuests[response.questId];
        if (quest) {
          const category = quest.category.toLowerCase();
          responsePatterns[category] = (responsePatterns[category] || 0) + 1;
        }
      }

      return {
        totalResponses: responses.length,
        averagePersonality: avgPersonality,
        moodTrend,
        emotionalNeeds,
        compatibilityScore,
        recentActivity,
        responsePatterns,
        userProfile,
      };
    } catch (error) {
      this._logError(error, "Error getting comprehensive analytics");
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
