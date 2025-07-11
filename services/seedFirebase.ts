import userService from "./userServices";
import questService from "./questServices";
import analyticsService from "./analyticsServices";
import firestore from "@react-native-firebase/firestore";

async function seedFirebase() {
  try {
    console.log("🚀 Starting Firebase seeding process...");

    const dummyUserId = "seed-user-123"; // Use a consistent dummy ID for seeding

    // --- Seed initial user data ---
    // Note: userService.saveUserProfile handles the timestamp and default values
    await userService.saveUserProfile(dummyUserId, {
      email: "seed@example.com",
      displayName: "Seed User",
      compatibilityScore: 75,
      currentPoints: 500,
      privacyLevel: "public",
      phoneNumber: "+911234567890",
      // If emotionalProfile is expected by analytics, it should be part of the User interface
      // and passed here, or handled by saveUserProfile.
      // For now, assuming analyticsService adapts or emotionalProfile is updated later.
    });

    // --- Seed personality traits ---
    // userService.savePersonalityTrait adds the timestamp
    await userService.savePersonalityTrait(dummyUserId, {
      openness: { value: 0.7, weight: 1 },
      neuroticism: { value: 0.4, weight: 1 },
      agreeableness: { value: 0.8, weight: 1 },
    });

    // --- Seed mood entries ---
    // userService.saveMoodEntry adds the timestamp
    await userService.saveMoodEntry(dummyUserId, {
      state: "Happy",
      intensity: 8,
      trigger: "Sunny weather",
    });

    await userService.saveMoodEntry(dummyUserId, {
      state: "Relaxed",
      intensity: 7,
      trigger: "Reading a book",
    });

    // --- Seed points transactions ---
    // userService.savePointsTransaction adds the timestamp and updates user's currentPoints
    await userService.savePointsTransaction(dummyUserId, {
      amount: 100,
      type: "earned",
      reason: "Initial bonus",
    });

    await userService.savePointsTransaction(dummyUserId, {
      amount: 50,
      type: "earned",
      reason: "Completed onboarding quest",
    });

    // --- Seed quests ---
    // questService.saveQuest adds the createdAt timestamp
    const quest1Id = await questService.saveQuest({
      questionText: "What makes you feel most alive?",
      category: "self-reflection",
      options: ["Nature", "Art", "Helping others", "Learning something new"],
      pointValue: 20,
      responseOptions: [
        "Nature",
        "Art",
        "Helping others",
        "Learning something new",
      ],
      responseCount: 0,
    });

    const quest2Id = await questService.saveQuest({
      questionText: "How do you handle stress?",
      category: "emotional intelligence",
      options: [
        "Exercise",
        "Meditation",
        "Talking to a friend",
        "Listening to music",
      ],
      pointValue: 15,
      responseOptions: [
        "Exercise",
        "Meditation",
        "Talking to a friend",
        "Listening to music",
      ],
      responseCount: 0,
    });

    const quest3Id = await questService.saveQuest({
      questionText: "Describe a time you felt truly happy.",
      category: "emotional well-being",
      options: [
        "Spending time with loved ones",
        "Achieving a goal",
        "Experiencing something new",
        "Helping someone in need",
      ],
      pointValue: 25,
      responseOptions: [
        "Spending time with loved ones",
        "Achieving a goal",
        "Experiencing something new",
        "Helping someone in need",
      ],
      responseCount: 0,
    });

    const quest4Id = await questService.saveQuest({
      questionText: "What is one thing you're grateful for today?",
      category: "gratitude",
      options: [
        "My health",
        "My family/friends",
        "My job/studies",
        "A simple pleasure",
      ],
      pointValue: 10,
      responseOptions: [
        "My health",
        "My family/friends",
        "My job/studies",
        "A simple pleasure",
      ],
      responseCount: 0,
    });

    const quest5Id = await questService.saveQuest({
      questionText: "What is your favorite way to relax?",
      category: "well-being",
      options: [
        "Reading",
        "Listening to music",
        "Walking in nature",
        "Playing games",
      ],
      pointValue: 12,
      responseOptions: [
        "Reading",
        "Listening to music",
        "Walking in nature",
        "Playing games",
      ],
      responseCount: 0,
    });

    console.log("New Quest 5 ID:", quest5Id);

    // --- Seed quest responses ---
    // questService.saveQuestResponse adds the timestamp
    await questService.saveQuestResponse(dummyUserId, {
      questId: quest1Id,
      response: "Nature",
    });

    await questService.saveQuestResponse(dummyUserId, {
      questId: quest2Id,
      response: "Meditation",
    });

    await questService.saveQuestResponse(dummyUserId, {
      questId: quest3Id,
      response: "Achieving a goal",
    });

    await questService.saveQuestResponse(dummyUserId, {
      questId: quest4Id,
      response: "My family/friends",
    });

    await questService.saveQuestResponse(dummyUserId, {
      questId: quest1Id,
      response: "Learning something new",
    });

    await questService.saveQuestResponse(dummyUserId, {
      questId: quest2Id,
      response: "Talking to a friend",
    });

    await questService.saveQuestResponse(dummyUserId, {
      questId: quest3Id,
      response: "Experiencing something new",
    });

    await questService.saveQuestResponse(dummyUserId, {
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

export default seedFirebase;
