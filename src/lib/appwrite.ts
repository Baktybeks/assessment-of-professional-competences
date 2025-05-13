// lib/appwrite.ts
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Client, Account, Databases, Query, ID, Storage } from "appwrite";

// Инициализация клиента Appwrite
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Замените на свой эндпоинт Appwrite
  .setProject(appwriteConfig.projectId); // Замените на ID вашего проекта в Appwrite

// Экспорт сервисов Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Константы для работы с базой данных
export const DATABASES = {
  MAIN_DB: appwriteConfig.databaseId,
};

export const COLLECTIONS = {
  USERS: appwriteConfig.collections.users,
  CATEGORIES: appwriteConfig.collections.categories,
  TESTS: appwriteConfig.collections.tests,
  QUESTIONS: appwriteConfig.collections.questions,
  TEST_RESULTS: appwriteConfig.collections.testResults,
};

// Вспомогательные функции для работы с Appwrite
export const createDocument = async (collectionId: string, data: any) => {
  try {
    return await databases.createDocument(
      DATABASES.MAIN_DB,
      collectionId,
      ID.unique(),
      data
    );
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const getDocument = async (collectionId: string, documentId: string) => {
  try {
    return await databases.getDocument(
      DATABASES.MAIN_DB,
      collectionId,
      documentId
    );
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
};

export const updateDocument = async (
  collectionId: string,
  documentId: string,
  data: any
) => {
  try {
    return await databases.updateDocument(
      DATABASES.MAIN_DB,
      collectionId,
      documentId,
      data
    );
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (
  collectionId: string,
  documentId: string
) => {
  try {
    return await databases.deleteDocument(
      DATABASES.MAIN_DB,
      collectionId,
      documentId
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export const listDocuments = async (
  collectionId: string,
  queries: any[] = []
) => {
  try {
    return await databases.listDocuments(
      DATABASES.MAIN_DB,
      collectionId,
      queries
    );
  } catch (error) {
    console.error("Error listing documents:", error);
    throw error;
  }
};

export const getUsersByRole = async (role: string) => {
  try {
    return await databases.listDocuments(DATABASES.MAIN_DB, COLLECTIONS.USERS, [
      Query.equal("role", role),
    ]);
  } catch (error) {
    console.error("Error getting users by role:", error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    return await databases.getDocument(
      DATABASES.MAIN_DB,
      COLLECTIONS.USERS,
      userId
    );
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

export const activateUser = async (userId: string) => {
  try {
    return await databases.updateDocument(
      DATABASES.MAIN_DB,
      COLLECTIONS.USERS,
      userId,
      { isActive: true }
    );
  } catch (error) {
    console.error("Error activating user:", error);
    throw error;
  }
};

export const getTestsByCategory = async (categoryId: string) => {
  try {
    return await databases.listDocuments(DATABASES.MAIN_DB, COLLECTIONS.TESTS, [
      Query.equal("categoryId", categoryId),
    ]);
  } catch (error) {
    console.error("Error getting tests by category:", error);
    throw error;
  }
};

export const getTestQuestions = async (testId: string) => {
  try {
    return await databases.listDocuments(
      DATABASES.MAIN_DB,
      COLLECTIONS.QUESTIONS,
      [Query.equal("testId", testId)]
    );
  } catch (error) {
    console.error("Error getting test questions:", error);
    throw error;
  }
};

export const submitTestResult = async (
  userId: string,
  testId: string,
  score: number
) => {
  try {
    return await databases.createDocument(
      DATABASES.MAIN_DB,
      COLLECTIONS.TEST_RESULTS,
      ID.unique(),
      {
        userId,
        testId,
        score,
        completedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Error submitting test result:", error);
    throw error;
  }
};

export const getUserTestResults = async (userId: string) => {
  try {
    return await databases.listDocuments(
      DATABASES.MAIN_DB,
      COLLECTIONS.TEST_RESULTS,
      [Query.equal("userId", userId)]
    );
  } catch (error) {
    console.error("Error getting user test results:", error);
    throw error;
  }
};

export const getAllTestResults = async () => {
  try {
    return await databases.listDocuments(
      DATABASES.MAIN_DB,
      COLLECTIONS.TEST_RESULTS
    );
  } catch (error) {
    console.error("Error getting all test results:", error);
    throw error;
  }
};
