// components/VideoUploader.tsx
import React from 'react';
import { Button, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadToFirebaseStorage } from '../utils/uploadHelper';

interface VideoUploaderProps {
  userDocId: string; // Firestore docID for the user
}

export default function VideoUploader({ userDocId }: VideoUploaderProps) {
  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
    });

    if (!res.canceled && res.assets.length > 0) {
      const uri = res.assets[0].uri;
      await uploadToFirebaseStorage(
        uri,
        `media/video/${userDocId}/${Date.now()}.mp4`
      );
      Alert.alert('Upload complete', 'Video uploaded successfully');
    }
  };

  return (
    <View>
      <Button title="🎥 Pick / Record Video" onPress={pickVideo} />
    </View>
  );
}
