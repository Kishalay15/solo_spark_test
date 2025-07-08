import firebaseService from "./firebaseServices";
import analyticsService from "./analyticsServices";
import firestore from "@react-native-firebase/firestore";

async function seedFirebase() {
  try {
    console.log("🚀 Starting Firebase seeding process...");

    const dummyUserId = "seed-user-123"; // Use a consistent dummy ID for seeding

    // --- Seed initial user data ---
    // Note: firebaseService.saveUserProfile handles the timestamp and default values
    await firebaseService.saveUserProfile(dummyUserId, {
      email: "seed@example.com",
      displayName: "Seed User",
      compatibilityScore: 75,
      currentPoints: 500,
      privacyLevel: "public",
      // If emotionalProfile is expected by analytics, it should be part of the User interface
      // and passed here, or handled by saveUserProfile.
      // For now, assuming analyticsService adapts or emotionalProfile is updated later.
    });

    // --- Seed personality traits ---
    // firebaseService.savePersonalityTrait adds the timestamp
    await firebaseService.savePersonalityTrait(dummyUserId, {
      openness: { value: 0.7, weight: 1 },
      neuroticism: { value: 0.4, weight: 1 },
      agreeableness: { value: 0.8, weight: 1 },
    });

    // --- Seed mood entries ---
    // firebaseService.saveMoodEntry adds the timestamp
    await firebaseService.saveMoodEntry(dummyUserId, {
      state: "Happy",
      intensity: 8,
      trigger: "Sunny weather",
    });

    await firebaseService.saveMoodEntry(dummyUserId, {
      state: "Relaxed",
      intensity: 7,
      trigger: "Reading a book",
    });

    // --- Seed points transactions ---
    // firebaseService.savePointsTransaction adds the timestamp and updates user's currentPoints
    await firebaseService.savePointsTransaction(dummyUserId, {
      amount: 100,
      type: "earned",
      reason: "Initial bonus",
    });

    await firebaseService.savePointsTransaction(dummyUserId, {
      amount: 50,
      type: "earned",
      reason: "Completed onboarding quest",
    });

    // --- Seed quests ---
    // firebaseService.saveQuest adds the createdAt timestamp
    const quest1Id = await firebaseService.saveQuest({
      questionText: "What makes you feel most alive?",
      category: "self-reflection",
      options: ["Nature", "Art", "Helping others", "Learning something new"],
      pointValue: 20,
      responseOptions: ["Nature", "Art", "Helping others", "Learning something new"],
      responseCount: 0,
    });

    const quest2Id = await firebaseService.saveQuest({
      questionText: "How do you handle stress?",
      category: "emotional intelligence",
      options: ["Exercise", "Meditation", "Talking to a friend", "Listening to music"],
      pointValue: 15,
      responseOptions: ["Exercise", "Meditation", "Talking to a friend", "Listening to music"],
      responseCount: 0,
    });

    const quest3Id = await firebaseService.saveQuest({
      questionText: "Describe a time you felt truly happy.",
      category: "emotional well-being",
      options: ["Spending time with loved ones", "Achieving a goal", "Experiencing something new", "Helping someone in need"],
      pointValue: 25,
      responseOptions: ["Spending time with loved ones", "Achieving a goal", "Experiencing something new", "Helping someone in need"],
      responseCount: 0,
    });

    const quest4Id = await firebaseService.saveQuest({
      questionText: "What is one thing you're grateful for today?",
      category: "gratitude",
      options: ["My health", "My family/friends", "My job/studies", "A simple pleasure"],
      pointValue: 10,
      responseOptions: ["My health", "My family/friends", "My job/studies", "A simple pleasure"],
      responseCount: 0,
    });

    // --- Seed quest responses ---
    // firebaseService.saveQuestResponse adds the timestamp
    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest1Id,
      response: "Nature",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest2Id,
      response: "Meditation",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest3Id,
      response: "Achieving a goal",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest4Id,
      response: "My family/friends",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest1Id,
      response: "Learning something new",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest2Id,
      response: "Talking to a friend",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest3Id,
      response: "Experiencing something new",
    });

    await firebaseService.saveQuestResponse(dummyUserId, {
      questId: quest4Id,
      response: "A simple pleasure",
    });

    console.log("✅ Firebase seeding completed successfully!");

    // Optional: Run analytics after seeding
    console.log("📊 Running analytics after seeding...");
    // Note: analyticsService.analyzeAndUpdateUserSchema now accepts a userId
    await analyticsService.analyzeAndUpdateUserSchema(dummyUserId);
    console.log("✅ Analytics run completed.");
  } catch (error) {
    console.error("❌ Error seeding Firebase:", error);
  }
}

seedFirebase();

export default seedFirebase;