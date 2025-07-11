import firestore, { where } from "@react-native-firebase/firestore";
import type {
  AnalyticsQuest,
  AnalyticsQuestResponse,
  AnalyticsUserProfile,
  PersonalityResponse,
  AnalysisResult,
  ResponsePatterns,
} from "./analyticsServices.types";
import _logError from "@/utils/logErrors";
import {
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
  EMOTIONAL_NEEDS_KEYWORDS,
  PERSONALITY_IMPACT_KEYWORDS,
} from "@/constants/analyticsKeywords";
import questService from "./questServices";
import userService from "./userServices";
import { Metrics } from "../types/user.types";

class AnalyticsService {
  private getCurrentUserId(userId?: string): string {
    return userId || "seed-user-123";
  }

  async analyzeAndUpdateUserSchema(userId: string): Promise<{
    personalityUpdated: boolean;
    moodUpdated: boolean;
    emotionalNeedsUpdated: boolean;
    compatibilityScoreUpdated: boolean;
  }> {
    try {
      console.log("🔄 Starting comprehensive user schema analysis...");

      const [responses, userProfile, metricsDoc] = await Promise.all([
        questService.fetchQuestResponses(userId),
        userService.fetchUserProfile(userId),
        firestore()
          .collection("solo_spark_user")
          .doc(userId)
          .collection("metrics")
          .doc("summary")
          .get(),
      ]);

      const metrics = metricsDoc.exists()
        ? (metricsDoc.data() as Metrics)
        : null;

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const results = {
        personalityUpdated: false,
        moodUpdated: false,
        emotionalNeedsUpdated: false,
        compatibilityScoreUpdated: false,
      };

      const analysis = await this.analyzeQuestResponses(responses);

      if (
        analysis.personalityChanges.openness !== 0 ||
        analysis.personalityChanges.neuroticism !== 0 ||
        analysis.personalityChanges.agreeableness !== 0
      ) {
        await this.updatePersonalityTraits(userId, analysis.personalityChanges);
        results.personalityUpdated = true;
      }

      console.log("🔍 Mood analysis:", {
        currentMood: metrics?.emotionalProfileMetrics?.currentMood || "Unknown",
        newMoodTrend: analysis.moodTrend,
        moodScores: analysis.moodScores,
      });

      const shouldUpdateMood =
        analysis.moodTrend !==
          (metrics?.emotionalProfileMetrics?.currentMood || "Unknown") ||
        analysis.moodScores.positive > 0 ||
        analysis.moodScores.negative > 0 ||
        (analysis.moodTrend === "Positive" &&
          (metrics?.emotionalProfileMetrics?.currentMood || "Unknown") !==
            "Positive") ||
        (analysis.moodTrend === "Negative" &&
          (metrics?.emotionalProfileMetrics?.currentMood || "Unknown") !==
            "Negative");

      if (shouldUpdateMood) {
        await this.updateUserMood(userId, analysis.moodTrend);
        results.moodUpdated = true;
        console.log(
          "✅ Mood updated from",
          metrics?.emotionalProfileMetrics?.currentMood || "Unknown",
          "to",
          analysis.moodTrend
        );

        // Update metrics/summary with emotionalProfileMetrics
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
            emotionalProfileMetrics: {
              currentMood: analysis.moodTrend,
              moodFrequency: "Stable",
            },
          };
          await metricsRef.update(updatedMetrics);
          console.log(
            "✅ Metrics emotionalProfileMetrics updated successfully"
          );
        } else {
          const initialMetrics: Metrics = {
            categoryAffinity: { growth: 0, social: 0 },
            engagementProfile: {
              interactionFrequency: 0,
              completedQuests: [],
            },
            emotionalProfileMetrics: {
              currentMood: analysis.moodTrend,
              moodFrequency: "Stable", // Placeholder
            },
          };
          await metricsRef.set(initialMetrics);
          console.log(
            "✅ Initial metrics document created with emotionalProfileMetrics"
          );
        }
      } else {
        console.log("⏭️ Mood not updated - no significant change detected");
      }

      if (
        !userProfile.emotionalProfile.emotionalNeeds ||
        analysis.emotionalNeeds.some(
          (need) => !userProfile.emotionalProfile.emotionalNeeds.includes(need)
        ) ||
        userProfile.emotionalProfile.emotionalNeeds.some(
          (need) => !analysis.emotionalNeeds.includes(need)
        )
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
      _logError(error, "Error in user schema analysis");
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
    const dominantEmotionalNeeds = Object.keys(emotionalNeedsPatterns).sort(
      (a, b) => emotionalNeedsPatterns[b] - emotionalNeedsPatterns[a]
    );

    return {
      personalityChanges,
      moodTrend,
      moodScores,
      emotionalNeeds:
        dominantEmotionalNeeds.length > 0
          ? dominantEmotionalNeeds
          : ["Support"],
      responsePatterns,
    };
  }

  // Update personality traits
  private async updatePersonalityTraits(
    userId: string,
    changes: PersonalityResponse
  ): Promise<void> {
    try {
      const currentTraits = await userService.fetchPersonalityTraits(userId);
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
      _logError(error, "Error updating personality traits");
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
        .collection("metrics")
        .doc("summary")
        .update({
          "emotionalProfileMetrics.currentMood": newMood,
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
      _logError(error, "Error updating user mood");
      throw error;
    }
  }

  // Update emotional needs
  private async updateEmotionalNeeds(
    userId: string,
    newNeeds: string[]
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
      _logError(error, "Error updating emotional needs");
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
      _logError(error, "Error updating compatibility score");
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
    for (const keyword of positiveKeywords) {
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
    for (const keyword of negativeKeywords) {
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
    emotionalNeeds: string[];
    compatibilityScore: number;
    recentActivity: string;
    responsePatterns: ResponsePatterns;
    userProfile: AnalyticsUserProfile | null;
  }> {
    try {
      const [responses, traits, moods, userProfile, metricsDoc] =
        await Promise.all([
          questService.fetchQuestResponses(userId),
          userService.fetchPersonalityTraits(userId),
          userService.fetchMoodEntries(userId),
          userService.fetchUserProfile(userId),
          firestore()
            .collection("solo_spark_user")
            .doc(userId)
            .collection("metrics")
            .doc("summary")
            .get(),
        ]);

      const metrics = metricsDoc.exists()
        ? (metricsDoc.data() as Metrics)
        : null;

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

      // Get mood trend from metrics, fallback to moods history if not available
      const moodTrend =
        metrics?.emotionalProfileMetrics?.currentMood ||
        (moods.length > 0 ? moods[0].mood : "Unknown");

      // Get emotional needs
      const emotionalNeeds = userProfile?.emotionalProfile?.emotionalNeeds || [
        "Unknown",
      ];

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
      _logError(error, "Error getting comprehensive analytics");
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
