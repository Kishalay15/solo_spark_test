// services/taskService.ts

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Task } from '../types/Task';

/**
 * 🔹 Collection Reference
 */
const tasksRef = firestore().collection('solo_spark_tasks');

// 🔸 Create a new task
export const createTask = async (task: Task): Promise<string | null> => {
  try {
    const newTaskRef = await tasksRef.add({
      ...task,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return newTaskRef.id;
  } catch (error) {
    console.error('❌ Error creating task:', error);
    return null;
  }
};

// 🔸 Get a single task by ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    const doc = await tasksRef.doc(taskId).get();
    if (doc.exists) {
      return { ...(doc.data() as Task), id: doc.id };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching task:', error);
    return null;
  }
};

// 🔸 Update a task (partial update allowed)
export const updateTask = async (
  taskId: string,
  updatedData: Partial<Task>
): Promise<boolean> => {
  try {
    await tasksRef.doc(taskId).update({
      ...updatedData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('❌ Error updating task:', error);
    return false;
  }
};

// 🔸 Delete a task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    await tasksRef.doc(taskId).delete();
    return true;
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    return false;
  }
};

// 🔸 Get all tasks for a specific user
export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  try {
    const snapshot = await tasksRef.where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ ...(doc.data() as Task), id: doc.id }));
  } catch (error) {
    console.error('❌ Error fetching user tasks:', error);
    return [];
  }
};
