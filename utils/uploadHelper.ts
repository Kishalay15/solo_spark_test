import storage from "@react-native-firebase/storage";

const uriToBlob = async (uri: string): Promise<Blob> => {
  try {
    const resp = await fetch(uri);
    if (!resp.ok) {
      throw new Error(`Failed to fetch URI: ${resp.statusText}`);
    }
    return await resp.blob();
  } catch (error) {
    console.error("Error converting URI to Blob:", error);
    throw error;
  }
};

export const uploadToFirebaseStorage = async (
  uri: string,
  storagePath: string
): Promise<string> => {
  try {
    const blob = await uriToBlob(uri);
    const ref = storage().ref(storagePath);

    const task = ref.put(blob);

    //progress bar for ui
    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error during upload:", error);
        throw error;
      },
      () => {
        console.log("Upload complete!");
      }
    );

    await task;

    const downloadURL = await ref.getDownloadURL();
    console.log("Uploaded URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
};
