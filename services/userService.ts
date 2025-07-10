// services/userService.ts
import firestore from '@react-native-firebase/firestore';
import { User } from '../types/User';

const USERS_COLLECTION = 'solo_spark_user';

export const createUser = async (userId: string, data: User) => {
  try {
    await firestore().collection(USERS_COLLECTION).doc(userId).set(data);
    console.log('✅ User created successfully');
  } catch (err) {
    console.error('❌ Failed to create user:', err);
    throw err;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const doc = await firestore().collection(USERS_COLLECTION).doc(userId).get();
    return doc.exists ? (doc.data() as User) : null;
  } catch (err) {
    console.error('❌ Failed to fetch user:', err);
    throw err;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  try {
    await firestore().collection(USERS_COLLECTION).doc(userId).update(updates);
    console.log('✅ User updated successfully');
  } catch (err) {
    console.error('❌ Failed to update user:', err);
    throw err;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await firestore().collection(USERS_COLLECTION).doc(userId).delete();
    console.log('🗑️ User deleted successfully');
  } catch (err) {
    console.error('❌ Failed to delete user:', err);
    throw err;
  }
};
