// components/AudioRecorder.tsx
import React, { useState } from 'react';
import { Button, View, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToFirebaseStorage } from '../utils/uploadHelper';

interface AudioRecorderProps {
  userDocId: string; // Firestore docID for the user
}

export default function AudioRecorder({ userDocId }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  /* ────── RECORD AUDIO ────── */
  const startRecording = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission denied', 'Microphone access is required.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      await uploadToFirebaseStorage(
        uri,
        `media/audio/${userDocId}/${Date.now()}.m4a`
      );
      Alert.alert('Upload complete', 'Audio uploaded successfully');
    }
  };

  /* ────── PICK EXISTING AUDIO ────── */
  const pickAudio = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (res.type === 'success') {
      await uploadToFirebaseStorage(
        res.uri,
        `media/audio/${userDocId}/${Date.now()}.m4a`
      );
      Alert.alert('Upload complete', 'Audio file uploaded');
    }
  };

  return (
    <View>
      <Button
        title={recording ? '🛑 Stop Recording' : '🎙️ Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      <View style={{ marginVertical: 10 }}>
        <Button title="📁 Pick Existing Audio" onPress={pickAudio} />
      </View>
    </View>
  );
}
