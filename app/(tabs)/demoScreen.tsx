import React from "react";
import { View, Text } from "react-native";
import VideoUploader from "../../components/videoUploader";
import AudioRecorder from "../../components/audioRecorder";

export default function DemoScreen() {
  const userDocId = "seed-user-123";

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-8">Media Upload Demo</Text>
      <View className="mb-5 w-4/5">
        <VideoUploader userDocId={userDocId} />
      </View>
      <View className="mb-5 w-4/5">
        <AudioRecorder userDocId={userDocId} />
      </View>
    </View>
  );
}
