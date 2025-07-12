import React, { useState } from "react";
import { Button, View, Alert, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToFirebaseStorage } from "../utils/uploadHelper";
import type { VideoUploaderProps } from "./videoUploader.types";

export default function VideoUploader({ userDocId }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const pickMedia = async () => {
    setIsUploading(true);
    setUploadStatus("Picking media...");
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
      });

      if (res.canceled) {
        setUploadStatus("Media selection cancelled.");
        setIsUploading(false);
        return;
      }

      if (res.assets.length > 0) {
        const asset = res.assets[0];
        const uri = asset.uri;
        const fileType = asset.type === "video" ? "video" : "image";
        const fileExtension = uri.substring(uri.lastIndexOf("."));

        setUploadStatus(`Uploading ${fileType}...`);
        const downloadURL = await uploadToFirebaseStorage(
          uri,
          `media/${fileType}/${userDocId}/${Date.now()}${fileExtension}`
        );

        setUploadStatus("Upload complete!");
        Alert.alert(
          "Upload Success",
          `${fileType[0].toUpperCase() + fileType.slice(1)} uploaded successfully: ${downloadURL}`
        );
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
    <View style={{ padding: 20, alignItems: "center" }}>
      <Button
        title={isUploading ? "Uploading..." : "🎥 Pick / Record Video or Image"}
        onPress={pickMedia}
        disabled={isUploading}
      />
      {isUploading && (
        <ActivityIndicator
          size="small"
          color="#0000ff"
          style={{ marginTop: 10 }}
        />
      )}
      {uploadStatus ? (
        <Text style={{ marginTop: 10 }}>{uploadStatus}</Text>
      ) : null}
    </View>
  );
}
