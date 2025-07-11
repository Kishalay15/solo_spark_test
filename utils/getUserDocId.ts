// utils/getUserDocId.ts
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const getUserDocId = async (): Promise<string | null> => {
  try {
    const user = auth().currentUser;

    if (!user?.email) {
      throw new Error('User not authenticated or missing email.');
    }

    const userSnapshot = await firestore()
      .collection('solo_spark_user')
      .where('email', '==', user.email)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      return userSnapshot.docs[0].id; // 👈 This is the Firestore document ID (docId)
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to fetch user docId:', error);
    return null;
  }
};
