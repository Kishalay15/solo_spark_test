import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import firebaseService from "@/services/userServices";
import { CreateUser } from "@/services/userServices.types";

const FirebaseTest: React.FC = () => {
  const userId = "seed-user-123";
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
    console.log(message);
  };

  const handleTestFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      addLog("🔥 Testing Firebase connection...");

      // Test if Firebase is initialized
      const app = firestore().app;
      addLog("✅ Firebase is initialized");
      addLog(`📱 Firebase app name: ${app.name}`);

      // Test Firestore write
      addLog("📝 Testing Firestore write...");
      const testDoc = {
        test: true,
        timestamp: firestore.FieldValue.serverTimestamp(),
        message: "Firebase connection test successful!",
      };

      await firestore().collection("test").doc("connection-test").set(testDoc);

      addLog("✅ Firestore write successful");

      // Test Firestore read
      addLog("📖 Testing Firestore read...");
      const doc = await firestore()
        .collection("test")
        .doc("connection-test")
        .get();

      if (doc.exists()) {
        addLog("✅ Firestore read successful");
        addLog(`📊 Document data: ${JSON.stringify(doc.data())}`);
      }

      addLog("✅ Firebase connection successful! Check console for details.");
      Alert.alert("Success", "Firebase connection test passed!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as any)?.code || "Unknown";
      const errorStack =
        error instanceof Error ? error.stack : "No stack trace";
      addLog(`❌ Firebase test failed: ${errorMessage}`);
      addLog(`❌ Error code: ${errorCode}`);
      addLog(`❌ Error stack: ${errorStack}`);

      Alert.alert("Error", `Firebase test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUserProfile = async () => {
    try {
      addLog("👤 Testing user profile save...");

      const userData: CreateUser = {
        email: "test@example.com",
        displayName: "Test User",
        compatibilityScore: 85,
        currentPoints: 100,
        privacyLevel: "private",
        phoneNumber: "+1234567890",
      };

      await firebaseService.saveUserProfile(userId, userData);
      addLog("✅ User profile saved successfully!");
      Alert.alert("Success", "User profile saved to Firebase!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ User profile save failed: ${errorMessage}`);
      Alert.alert("Error", `User profile save failed: ${errorMessage}`);
    }
  };

  const handleCreateCompleteProfile = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      addLog("🔥 Creating complete user profile with all subcollections...");

      await firebaseService.createCompleteUserProfile(userId);

      addLog("✅ Complete user profile created successfully!");
      addLog("📊 Check Firebase console for:");
      addLog("   - solo_spark_user/demo-user-123 (main profile)");
      addLog(
        "   - solo_spark_user/demo-user-123/PersonalityTraits (subcollection)"
      );
      addLog("   - solo_spark_user/demo-user-123/MoodHistory (subcollection)");
      addLog(
        "   - solo_spark_user/demo-user-123/PointsTransactions (subcollection)"
      );
      addLog(
        "   - solo_spark_user/demo-user-123/QuestResponses (subcollection)"
      );
      addLog("   - solo_spark_quest (collection)");

      Alert.alert(
        "Success",
        "Complete user profile created with all subcollections!"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ Complete profile creation failed: ${errorMessage}`);
      Alert.alert("Error", `Complete profile creation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIndividualSubcollections = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      addLog("🧪 Testing individual subcollections...");

      // Test PersonalityTraits
      addLog("📊 Testing PersonalityTraits...");
      const traitId = await firebaseService.savePersonalityTrait(userId, {
        openness: { value: 0.7, weight: 1 },
        neuroticism: { value: 0.4, weight: 1 },
        agreeableness: { value: 0.8, weight: 1 },
      });
      addLog(`✅ Personality trait saved with ID: ${traitId}`);

      // Test MoodHistory
      addLog("😊 Testing MoodHistory...");
      const moodId = await firebaseService.saveMoodEntry(userId, {
        state: "Excited",
        intensity: 7,
        trigger: "Test trigger",
      });
      addLog(`✅ Mood entry saved with ID: ${moodId}`);

      // Test PointsTransactions
      addLog("💰 Testing PointsTransactions...");
      const transactionId = await firebaseService.savePointsTransaction(
        userId,
        {
          amount: 25,
          type: "earned",
          reason: "Testing points transaction",
        }
      );
      addLog(`✅ Points transaction saved with ID: ${transactionId}`);

      // Test Quests
      addLog("❓ Testing Quests...");
      const questId = await firebaseService.saveQuest({
        questionText: "How do you handle stress?",
        category: "growth",
        options: ["A. Exercise", "B. Meditation", "C. Socialize"],
        pointValue: 20,
        responseOptions: ["A", "B", "C"],
        responseCount: 0,
      });
      addLog(`✅ Quest saved with ID: ${questId}`);

      // Test QuestResponses
      addLog("📝 Testing QuestResponses...");
      const responseId = await firebaseService.saveQuestResponse(userId, {
        questId: questId,
        response: "A. Exercise",
      });
      addLog(`✅ Quest response saved with ID: ${responseId}`);

      addLog("✅ All subcollections tested successfully!");
      Alert.alert("Success", "All subcollections tested successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ Subcollection testing failed: ${errorMessage}`);
      Alert.alert("Error", `Subcollection testing failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleTestFirebaseConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Testing..." : "Test Firebase Connection"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSaveUserProfile}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test User Profile Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.completeButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleCreateCompleteProfile}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Create Complete Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.subcollectionButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleSaveIndividualSubcollections}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Subcollections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
          <Text style={styles.clearButtonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Test Results:</Text>
        {testResults.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
        {testResults.length === 0 && (
          <Text style={styles.noLogs}>
            No test results yet. Run a test to see logs.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#34C759",
  },
  subcollectionButton: {
    backgroundColor: "#FF9500",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logsContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  logText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontFamily: "monospace",
  },
  noLogs: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default FirebaseTest;
