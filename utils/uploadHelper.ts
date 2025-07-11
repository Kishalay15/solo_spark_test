// utils/uploadHelper.ts
import storage from '@react-native-firebase/storage';

// convert local file URI to blob
const uriToBlob = async (uri: string): Promise<Blob> => {
  const resp = await fetch(uri);
  return await resp.blob();
};

export const uploadToFirebaseStorage = async (
  uri: string,
  storagePath: string
): Promise<string> => {
  const blob = await uriToBlob(uri);
  const ref = storage().ref(storagePath);
  await ref.put(blob);
  const downloadURL = await ref.getDownloadURL();
  console.log('Uploaded URL:', downloadURL);
  return downloadURL;
};
