import React, { useState } from "react";
import { Button, View, Alert, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToFirebaseStorage } from "../utils/uploadHelper";
import type { VideoUploaderProps } from "./videoUploader.types";

export default function VideoUploader({ userDocId }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const pickVideo = async () => {
    setIsUploading(true);
    setUploadStatus("Picking video...");
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
      });

      if (res.canceled) {
        setUploadStatus("Video selection cancelled.");
        setIsUploading(false);
        return;
      }

      if (res.assets.length > 0) {
        const uri = res.assets[0].uri;
        setUploadStatus("Uploading video...");
        const downloadURL = await uploadToFirebaseStorage(
          uri,
          `media/video/${userDocId}/${Date.now()}.mp4`
        );
        setUploadStatus("Upload complete!");
        Alert.alert("Upload Success", `Video uploaded successfully: ${downloadURL}`);
      } else {
        setUploadStatus("No video selected.");
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      setUploadStatus("Upload failed!");
      Alert.alert("Upload Error", "Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Button
        title={isUploading ? "Uploading..." : "🎥 Pick / Record Video"}
        onPress={pickVideo}
        disabled={isUploading}
      />
      {isUploading && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />} 
      {uploadStatus ? <Text style={{ marginTop: 10 }}>{uploadStatus}</Text> : null}
    </View>
  );
}
