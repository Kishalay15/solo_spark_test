import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  EmotionalNeeds,
  MoodFrequency,
  MoodState,
  PersonalityTrait,
  PointsTransaction,
  Quest,
  QuestResponse,
  User,
  UserSettings,
} from "./models.types";

const dummyUserId = "kishalay_1";
const dummyQuestId = "quest_001";

export const seedFirestoreData = async () => {
  const now = firestore.Timestamp.now();

  const userData: User = {
    email: "kl@gmail.com",
    displayName: "Solo Spark KL",
    profileCreatedAt: now,
    lastUpdatedAt: now,
    compatibilityScore: 85,
    currentPoints: 120,
    phoneNumber: "+918910457225",
    privacyLevel: "friends",
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .set(userData);

  const moodState: MoodState = {
    state: "motivated",
    intensity: 7,
    trigger: "morning journal",
    timestamp: now,
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("moods")
    .add(moodState);

  const moodFrequency: MoodFrequency = {
    dailyChanges: 3,
    weeklyAverage: 2.5,
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("moodFrequency")
    .doc("summary") //creates a single doc
    .set(moodFrequency);

  const personalityTrait: PersonalityTrait & {
    timestamp: FirebaseFirestoreTypes.Timestamp;
  } = {
    openness: { value: 8, weight: 0.7 },
    neuroticism: { value: 5, weight: 0.4 },
    agreeableness: { value: 9, weight: 0.6 },
    timestamp: now,
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("personalityTrait")
    .add(personalityTrait);

  const needs: EmotionalNeeds = {
    empathy: { type: "listening", intensity: 8 },
    validation: { type: "recognition", intensity: 7 },
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("emotionalNeeds")
    .add(needs);

  const questResponse: QuestResponse = {
    questId: dummyQuestId,
    response: "Growth is taking a pause and reflecting.",
    timestamp: now,
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("questResponses")
    .doc(dummyQuestId)
    .set(questResponse);

  const transaction: PointsTransaction = {
    amount: 10,
    type: "earned",
    reason: "Completed quest",
    timestamp: now,
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("transactions")
    .add(transaction);

  const userSettings: UserSettings = {
    notificationPreferences: {
      dailyReminder: true,
      newQuestAlert: true,
    },
    privacyLevel: "friends",
  };

  await firestore()
    .collection("solo_spark_user")
    .doc(dummyUserId)
    .collection("settings")
    .doc("main")
    .set(userSettings);

  const questData: Quest = {
    questionText: "What does growth mean to you today?",
    category: "growth",
    options: ["Learning", "Healing", "Trying"],
    responseOptions: ["Learning", "Healing", "Trying"],
    pointValue: 10,
    createdAt: now,
    responseCount: 0,
  };

  await firestore()
    .collection("solo_spark_quest")
    .doc(dummyQuestId)
    .set(questData);

  console.log(
    "Firestore seeded successfully into `solo_spark_user` and `solo_spark_quest`"
  );
};
