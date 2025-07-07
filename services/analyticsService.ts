import firestore from '@react-native-firebase/firestore';

interface PersonalityTrait {
  id: string;
  openness: number;
  neuroticism: number;
  agreeableness: number;
  timestamp: any;
}

interface MoodEntry {
  id: string;
  mood: string;
  notes: string;
  timestamp: any;
}

interface QuestResponse {
  id: string;
  questId: string;
  response: string;
  timestamp: any;
}

interface Quest {
  id: string;
  questionText: string;
  category: string;
  options: string[];
  pointValue: number;
}

interface UserProfile {
  email: string;
  displayName: string;
  emotionalProfile: {
    currentMood: string;
    moodFrequency: string;
    emotionalNeeds: string;
  };
  compatibilityScore: number;
  pointsProfile: {
    totalPoints: number;
    level: string;
  };
  userSettings: {
    notificationsEnabled: boolean;
    theme: string;
  };
}

class AnalyticsService {
  private getCurrentUserId(): string {
    return 'demo-user-123';
  }

  // Fetch user profile
  async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      const userId = this.getCurrentUserId();
      const userDoc = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .get();

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        console.log('✅ Fetched user profile');
        return userData;
      } else {
        console.log('❌ User profile not found');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching user profile:', errorMessage);
      throw error;
    }
  }

  // Fetch all personality traits for a user
  async fetchPersonalityTraits(): Promise<PersonalityTrait[]> {
    try {
      const userId = this.getCurrentUserId();
      const traitsSnapshot = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('PersonalityTraits')
        .orderBy('timestamp', 'desc')
        .get();

      const traits: PersonalityTrait[] = [];
      traitsSnapshot.forEach((doc) => {
        traits.push({
          id: doc.id,
          ...doc.data(),
        } as PersonalityTrait);
      });

      console.log(`✅ Fetched ${traits.length} personality traits`);
      return traits;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching personality traits:', errorMessage);
      throw error;
    }
  }

  // Fetch all mood entries for a user
  async fetchMoodEntries(): Promise<MoodEntry[]> {
    try {
      const userId = this.getCurrentUserId();
      const moodSnapshot = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('MoodHistory')
        .orderBy('timestamp', 'desc')
        .get();

      const moods: MoodEntry[] = [];
      moodSnapshot.forEach((doc) => {
        moods.push({
          id: doc.id,
          ...doc.data(),
        } as MoodEntry);
      });

      console.log(`✅ Fetched ${moods.length} mood entries`);
      return moods;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching mood entries:', errorMessage);
      throw error;
    }
  }

  // Fetch all quest responses for a user
  async fetchQuestResponses(): Promise<QuestResponse[]> {
    try {
      const userId = this.getCurrentUserId();
      const responsesSnapshot = await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('QuestResponses')
        .orderBy('timestamp', 'desc')
        .get();

      const responses: QuestResponse[] = [];
      responsesSnapshot.forEach((doc) => {
        responses.push({
          id: doc.id,
          ...doc.data(),
        } as QuestResponse);
      });

      console.log(`✅ Fetched ${responses.length} quest responses`);
      return responses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching quest responses:', errorMessage);
      throw error;
    }
  }

  // Fetch quest details by ID
  async fetchQuestById(questId: string): Promise<Quest | null> {
    try {
      const questDoc = await firestore()
        .collection('solo_spark_quest')
        .doc(questId)
        .get();

      if (questDoc.exists()) {
        const quest = {
          id: questDoc.id,
          ...questDoc.data(),
        } as Quest;
        console.log(`✅ Fetched quest: ${quest.questionText}`);
        return quest;
      } else {
        console.log(`❌ Quest not found: ${questId}`);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching quest:', errorMessage);
      throw error;
    }
  }

  // Comprehensive analysis of quest responses and update user schema
  async analyzeAndUpdateUserSchema(): Promise<{
    personalityUpdated: boolean;
    moodUpdated: boolean;
    emotionalNeedsUpdated: boolean;
    compatibilityScoreUpdated: boolean;
  }> {
    try {
      console.log('🔄 Starting comprehensive user schema analysis...');
      
      const [responses, userProfile] = await Promise.all([
        this.fetchQuestResponses(),
        this.fetchUserProfile(),
      ]);

      if (!userProfile) {
        throw new Error('User profile not found');
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
      if (analysis.personalityChanges.openness !== 0 || 
          analysis.personalityChanges.neuroticism !== 0 || 
          analysis.personalityChanges.agreeableness !== 0) {
        await this.updatePersonalityTraits(analysis.personalityChanges);
        results.personalityUpdated = true;
      }

      // Update mood with better logic and debugging
      console.log('🔍 Mood analysis:', {
        currentMood: userProfile.emotionalProfile.currentMood,
        newMoodTrend: analysis.moodTrend,
        moodScores: analysis.moodScores
      });
      
      // More aggressive mood update logic
      const shouldUpdateMood = 
        analysis.moodTrend !== userProfile.emotionalProfile.currentMood ||
        (analysis.moodScores.positive > 0 || analysis.moodScores.negative > 0) ||
        (analysis.moodTrend === 'Positive' && userProfile.emotionalProfile.currentMood !== 'Positive') ||
        (analysis.moodTrend === 'Negative' && userProfile.emotionalProfile.currentMood !== 'Negative');
      
      if (shouldUpdateMood) {
        await this.updateUserMood(analysis.moodTrend);
        results.moodUpdated = true;
        console.log('✅ Mood updated from', userProfile.emotionalProfile.currentMood, 'to', analysis.moodTrend);
      } else {
        console.log('⏭️ Mood not updated - no significant change detected');
      }

      // Update emotional needs
      if (analysis.emotionalNeeds !== userProfile.emotionalProfile.emotionalNeeds) {
        await this.updateEmotionalNeeds(analysis.emotionalNeeds);
        results.emotionalNeedsUpdated = true;
      }

      // Update compatibility score
      const newCompatibilityScore = this.calculateCompatibilityScore(analysis);
      if (newCompatibilityScore !== userProfile.compatibilityScore) {
        await this.updateCompatibilityScore(newCompatibilityScore);
        results.compatibilityScoreUpdated = true;
      }

      console.log('✅ User schema analysis completed:', results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error in user schema analysis:', errorMessage);
      throw error;
    }
  }

  // Analyze quest responses comprehensively
  private async analyzeQuestResponses(responses: QuestResponse[]): Promise<{
    personalityChanges: { openness: number; neuroticism: number; agreeableness: number };
    moodTrend: string;
    moodScores: { positive: number; negative: number; neutral: number };
    emotionalNeeds: string;
    responsePatterns: any;
  }> {
    const personalityChanges = { openness: 0, neuroticism: 0, agreeableness: 0 };
    const moodScores = { positive: 0, negative: 0, neutral: 0 };
    const emotionalNeedsPatterns: { [key: string]: number } = {};
    const responsePatterns: { [key: string]: number } = {};

    for (const response of responses) {
      const quest = await this.fetchQuestById(response.questId);
      if (!quest) continue;

      // Analyze personality impact
      const personalityImpact = this.analyzePersonalityImpact(quest, response.response);
      personalityChanges.openness += personalityImpact.openness;
      personalityChanges.neuroticism += personalityImpact.neuroticism;
      personalityChanges.agreeableness += personalityImpact.agreeableness;

      // Analyze mood impact
      const moodImpact = this.analyzeMoodImpact(quest, response.response);
      moodScores[moodImpact]++;

      // Analyze emotional needs
      const emotionalNeed = this.analyzeEmotionalNeeds(quest, response.response);
      emotionalNeedsPatterns[emotionalNeed] = (emotionalNeedsPatterns[emotionalNeed] || 0) + 1;

      // Track response patterns
      const category = quest.category.toLowerCase();
      responsePatterns[category] = (responsePatterns[category] || 0) + 1;
    }

    // Determine mood trend
    let moodTrend = 'Neutral';
    if (moodScores.positive > moodScores.negative) moodTrend = 'Positive';
    else if (moodScores.negative > moodScores.positive) moodTrend = 'Negative';

    // Determine dominant emotional need
    const dominantEmotionalNeed = Object.keys(emotionalNeedsPatterns).reduce((a, b) => 
      emotionalNeedsPatterns[a] > emotionalNeedsPatterns[b] ? a : b, 'Support'
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
  private async updatePersonalityTraits(changes: { openness: number; neuroticism: number; agreeableness: number }): Promise<void> {
    try {
      const currentTraits = await this.fetchPersonalityTraits();
      const latestTrait = currentTraits[0] || {
        openness: 5,
        neuroticism: 5,
        agreeableness: 5,
      };

      // Calculate new values (clamp between 1-10)
      const newTrait = {
        openness: Math.max(1, Math.min(10, latestTrait.openness + changes.openness)),
        neuroticism: Math.max(1, Math.min(10, latestTrait.neuroticism + changes.neuroticism)),
        agreeableness: Math.max(1, Math.min(10, latestTrait.agreeableness + changes.agreeableness)),
      };

      const userId = this.getCurrentUserId();
      await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('PersonalityTraits')
        .add({
          ...newTrait,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ Personality traits updated:', newTrait);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error updating personality traits:', errorMessage);
      throw error;
    }
  }

  // Update user mood in profile
  private async updateUserMood(newMood: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .update({
          'emotionalProfile.currentMood': newMood,
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Also add to mood history
      await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .collection('MoodHistory')
        .add({
          mood: newMood,
          notes: `Auto-updated based on quest response analysis`,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ User mood updated:', newMood);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error updating user mood:', errorMessage);
      throw error;
    }
  }

  // Update emotional needs
  private async updateEmotionalNeeds(newNeeds: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .update({
          'emotionalProfile.emotionalNeeds': newNeeds,
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ Emotional needs updated:', newNeeds);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error updating emotional needs:', errorMessage);
      throw error;
    }
  }

  // Update compatibility score
  private async updateCompatibilityScore(newScore: number): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await firestore()
        .collection('solo_spark_user')
        .doc(userId)
        .update({
          compatibilityScore: newScore,
          lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ Compatibility score updated:', newScore);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error updating compatibility score:', errorMessage);
      throw error;
    }
  }

  // Calculate compatibility score based on personality and responses
  private calculateCompatibilityScore(analysis: any): number {
    const baseScore = 50;
    let score = baseScore;

    // Adjust based on personality balance
    const personalityBalance = Math.abs(analysis.personalityChanges.openness) + 
                              Math.abs(analysis.personalityChanges.agreeableness) - 
                              Math.abs(analysis.personalityChanges.neuroticism);
    score += personalityBalance * 5;

    // Adjust based on mood
    if (analysis.moodTrend === 'Positive') score += 10;
    else if (analysis.moodTrend === 'Negative') score -= 10;

    // Adjust based on response consistency
    const totalResponses = Object.values(analysis.responsePatterns).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0);
    if (totalResponses > 5) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // Analyze how a quest response impacts personality traits
  private analyzePersonalityImpact(quest: Quest, response: string): {
    openness: number;
    neuroticism: number;
    agreeableness: number;
  } {
    const changes = { openness: 0, neuroticism: 0, agreeableness: 0 };
    const responseLower = response.toLowerCase();

    // Enhanced analysis based on quest category and response content
    switch (quest.category.toLowerCase()) {
      case 'emotional intelligence':
        if (responseLower.includes('talk') || responseLower.includes('communicate') || responseLower.includes('discuss')) {
          changes.agreeableness += 0.3;
          changes.openness += 0.2;
        } else if (responseLower.includes('meditate') || responseLower.includes('reflect') || responseLower.includes('think')) {
          changes.neuroticism -= 0.2;
          changes.openness += 0.3;
        } else if (responseLower.includes('exercise') || responseLower.includes('activity')) {
          changes.neuroticism -= 0.1;
          changes.openness += 0.1;
        }
        break;

      case 'personality':
        if (responseLower.includes('social') || responseLower.includes('group') || responseLower.includes('people')) {
          changes.agreeableness += 0.4;
          changes.openness += 0.3;
        } else if (responseLower.includes('alone') || responseLower.includes('quiet') || responseLower.includes('solitude')) {
          changes.neuroticism += 0.2;
          changes.openness -= 0.1;
        } else if (responseLower.includes('creative') || responseLower.includes('art') || responseLower.includes('music')) {
          changes.openness += 0.4;
        }
        break;

      case 'relationships':
        if (responseLower.includes('help') || responseLower.includes('support') || responseLower.includes('care')) {
          changes.agreeableness += 0.5;
        } else if (responseLower.includes('confront') || responseLower.includes('argue') || responseLower.includes('fight')) {
          changes.agreeableness -= 0.3;
          changes.neuroticism += 0.2;
        } else if (responseLower.includes('listen') || responseLower.includes('understand')) {
          changes.agreeableness += 0.3;
          changes.openness += 0.2;
        }
        break;

      case 'self-awareness':
        if (responseLower.includes('reflect') || responseLower.includes('think') || responseLower.includes('analyze')) {
          changes.openness += 0.4;
          changes.neuroticism -= 0.2;
        } else if (responseLower.includes('journal') || responseLower.includes('write')) {
          changes.openness += 0.3;
          changes.neuroticism -= 0.1;
        }
        break;

      case 'stress management':
        if (responseLower.includes('breathe') || responseLower.includes('relax') || responseLower.includes('calm')) {
          changes.neuroticism -= 0.3;
        } else if (responseLower.includes('avoid') || responseLower.includes('ignore')) {
          changes.neuroticism += 0.2;
          changes.agreeableness -= 0.1;
        }
        break;

      default:
        // Default small positive impact for any response
        changes.openness += 0.1;
        break;
    }

    return changes;
  }

  // Analyze how a quest response impacts mood
  private analyzeMoodImpact(quest: Quest, response: string): 'positive' | 'negative' | 'neutral' {
    const positiveKeywords = [
      'happy', 'excited', 'joy', 'love', 'help', 'support', 'achieve', 'success',
      'positive', 'good', 'great', 'wonderful', 'amazing', 'fantastic', 'calm',
      'peaceful', 'relaxed', 'confident', 'proud', 'grateful', 'blessed', 'yes',
      'agree', 'like', 'enjoy', 'fun', 'nice', 'better', 'improve', 'learn'
    ];

    const negativeKeywords = [
      'sad', 'angry', 'frustrated', 'worried', 'anxious', 'stress', 'conflict',
      'negative', 'bad', 'terrible', 'awful', 'hate', 'fear', 'scared', 'lonely',
      'depressed', 'hopeless', 'angry', 'irritated', 'annoyed', 'no', 'disagree',
      'hate', 'dislike', 'boring', 'difficult', 'hard', 'problem', 'issue'
    ];

    const responseLower = response.toLowerCase();

    // Check for positive keywords (more sensitive)
    for (const keyword of positiveKeywords) {
      if (responseLower.includes(keyword)) {
        console.log('😊 Positive mood detected from keyword:', keyword, 'in response:', response);
        return 'positive';
      }
    }

    // Check for negative keywords (more sensitive)
    for (const keyword of negativeKeywords) {
      if (responseLower.includes(keyword)) {
        console.log('😞 Negative mood detected from keyword:', keyword, 'in response:', response);
        return 'negative';
      }
    }

    // Also check quest category for mood hints
    if (quest.category.toLowerCase().includes('stress') || 
        quest.category.toLowerCase().includes('conflict') ||
        quest.category.toLowerCase().includes('problem')) {
      console.log('😞 Negative mood inferred from quest category:', quest.category);
      return 'negative';
    }

    if (quest.category.toLowerCase().includes('joy') || 
        quest.category.toLowerCase().includes('success') ||
        quest.category.toLowerCase().includes('achievement')) {
      console.log('😊 Positive mood inferred from quest category:', quest.category);
      return 'positive';
    }

    console.log('😐 Neutral mood for response:', response);
    return 'neutral';
  }

  // Analyze emotional needs from quest responses
  private analyzeEmotionalNeeds(quest: Quest, response: string): string {
    const responseLower = response.toLowerCase();

    if (responseLower.includes('support') || responseLower.includes('help') || responseLower.includes('care')) {
      return 'Support';
    } else if (responseLower.includes('connection') || responseLower.includes('social') || responseLower.includes('people')) {
      return 'Connection';
    } else if (responseLower.includes('space') || responseLower.includes('alone') || responseLower.includes('quiet')) {
      return 'Space';
    } else if (responseLower.includes('understanding') || responseLower.includes('listen') || responseLower.includes('empathy')) {
      return 'Understanding';
    } else if (responseLower.includes('recognition') || responseLower.includes('appreciate') || responseLower.includes('acknowledge')) {
      return 'Recognition';
    } else {
      return 'Support'; // Default emotional need
    }
  }

  // Get comprehensive analytics summary
  async getComprehensiveAnalytics(): Promise<{
    totalResponses: number;
    averagePersonality: { openness: number; neuroticism: number; agreeableness: number };
    moodTrend: string;
    emotionalNeeds: string;
    compatibilityScore: number;
    recentActivity: string;
    responsePatterns: any;
    userProfile: UserProfile | null;
  }> {
    try {
      const [responses, traits, moods, userProfile] = await Promise.all([
        this.fetchQuestResponses(),
        this.fetchPersonalityTraits(),
        this.fetchMoodEntries(),
        this.fetchUserProfile(),
      ]);

      // Calculate average personality traits
      const avgPersonality = traits.length > 0 
        ? {
            openness: traits.reduce((sum, t) => sum + t.openness, 0) / traits.length,
            neuroticism: traits.reduce((sum, t) => sum + t.neuroticism, 0) / traits.length,
            agreeableness: traits.reduce((sum, t) => sum + t.agreeableness, 0) / traits.length,
          }
        : { openness: 5, neuroticism: 5, agreeableness: 5 };

      // Get mood trend
      const moodTrend = moods.length > 0 ? moods[0].mood : 'Unknown';

      // Get emotional needs
      const emotionalNeeds = userProfile?.emotionalProfile?.emotionalNeeds || 'Unknown';

      // Get compatibility score
      const compatibilityScore = userProfile?.compatibilityScore || 50;

      // Get recent activity
      const recentActivity = responses.length > 0 
        ? `Last response: ${new Date(responses[0].timestamp?.toDate()).toLocaleDateString()}`
        : 'No recent activity';

      // Analyze response patterns
      const responsePatterns: { [key: string]: number } = {};
      for (const response of responses.slice(0, 10)) { // Last 10 responses
        const quest = await this.fetchQuestById(response.questId);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error getting comprehensive analytics:', errorMessage);
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService; 