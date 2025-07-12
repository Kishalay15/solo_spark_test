import React, { useState, useEffect, useRef } from "react";
import { Button, View, Alert, Text, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { uploadToFirebaseStorage } from "../utils/uploadHelper";
import { AudioRecorderProps } from "./audioRecorder.types";

export default function AudioRecorder({ userDocId }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Microphone access is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await rec.startAsync();

      if (isMounted.current) {
        setRecording(rec);
        setIsRecording(true);
        setStatusMessage("Recording...");
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (isMounted.current) {
        Alert.alert(
          "Recording Error",
          "Failed to start recording. Please try again."
        );
        setIsRecording(false);
        setStatusMessage("Recording failed.");
      }
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    if (isMounted.current) {
      setIsRecording(false);
      setStatusMessage("Stopping recording...");
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (isMounted.current) {
        setRecording(null);
      }

      if (uri) {
        if (isMounted.current) {
          setIsUploading(true);
          setStatusMessage("Uploading recorded audio...");
        }
        await uploadToFirebaseStorage(
          uri,
          `media/audio/${userDocId}/${Date.now()}.m4a`
        );
        if (isMounted.current) {
          Alert.alert(
            "Upload Success",
            "Recorded audio uploaded successfully!"
          );
          setStatusMessage("Upload complete!");
        }
      } else {
        if (isMounted.current) {
          setStatusMessage("No audio recorded.");
        }
      }
    } catch (error) {
      console.error("Failed to stop recording or upload:", error);
      if (isMounted.current) {
        Alert.alert(
          "Upload Error",
          "Failed to upload recorded audio. Please try again."
        );
        setStatusMessage("Upload failed!");
      }
    } finally {
      if (isMounted.current) {
        setIsUploading(false);
      }
    }
  };

  const pickAudio = async () => {
    if (isMounted.current) {
      setIsUploading(true);
      setStatusMessage("Picking audio file...");
    }
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "audio/*" });

      if (!isMounted.current) return;

      if (res.canceled) {
        if (isMounted.current) {
          setStatusMessage("Audio selection cancelled.");
          setIsUploading(false);
        }
        return;
      }

      if (res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        if (isMounted.current) {
          setStatusMessage("Uploading selected audio...");
        }
        await uploadToFirebaseStorage(
          uri,
          `media/audio/${userDocId}/${Date.now()}.m4a`
        );
        if (isMounted.current) {
          Alert.alert("Upload Success", "Audio file uploaded successfully!");
          setStatusMessage("Upload complete!");
        }
      } else {
        if (isMounted.current) {
          setStatusMessage("No audio file selected.");
        }
      }
    } catch (error: unknown) {
      if (isMounted.current) {
        if (error instanceof Error && error.message.includes("The current activity is no longer available")) {
          Alert.alert(
            "Error",
            "The document picker was interrupted. Please try again.",
            [{ text: "OK" }]
          );
        } else {
          console.error("Failed to pick or upload audio:", error);
          Alert.alert(
            "Upload Error",
            "Failed to upload audio file. Please try again."
          );
        }
        setStatusMessage("Upload failed!");
      }
    } finally {
      if (isMounted.current) {
        setIsUploading(false);
      }
    }
  };

  return (
    <View style={{ padding: 20, alignItems: "center" }}>
      <Button
        title={isRecording ? "🛑 Stop Recording" : "🎙️ Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isUploading}
      />
      <View style={{ marginVertical: 10 }}>
        <Button
          title="📁 Pick Existing Audio"
          onPress={pickAudio}
          disabled={isRecording || isUploading}
        />
      </View>
      {(isRecording || isUploading) && (
        <ActivityIndicator
          size="small"
          color="#0000ff"
          style={{ marginTop: 10 }}
        />
      )}
      {statusMessage ? (
        <Text style={{ marginTop: 10 }}>{statusMessage}</Text>
      ) : null}
    </View>
  );
}
