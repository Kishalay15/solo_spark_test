// services/shopService.ts
import firestore from '@react-native-firebase/firestore';
import { Reward } from '../types/Task'; // assuming Reward is defined in Task.ts

const SHOP_COLLECTION = 'solo_spark_shop';

export const createRewardItem = async (data: Reward) => {
  try {
    await firestore().collection(SHOP_COLLECTION).add(data);
    console.log('✅ Reward item added to shop');
  } catch (err) {
    console.error('❌ Failed to create reward item:', err);
    throw err;
  }
};

export const getAllRewards = async (): Promise<Reward[]> => {
  try {
    const snapshot = await firestore().collection(SHOP_COLLECTION).get();
    return snapshot.docs.map((doc) => doc.data() as Reward);
  } catch (err) {
    console.error('❌ Failed to fetch rewards:', err);
    throw err;
  }
};

export const updateRewardItem = async (
  rewardId: string,
  updates: Partial<Reward>
) => {
  try {
    await firestore().collection(SHOP_COLLECTION).doc(rewardId).update(updates);
    console.log('✅ Reward item updated');
  } catch (err) {
    console.error('❌ Failed to update reward item:', err);
    throw err;
  }
};

export const deleteRewardItem = async (rewardId: string) => {
  try {
    await firestore().collection(SHOP_COLLECTION).doc(rewardId).delete();
    console.log('🗑️ Reward item deleted');
  } catch (err) {
    console.error('❌ Failed to delete reward item:', err);
    throw err;
  }
};
