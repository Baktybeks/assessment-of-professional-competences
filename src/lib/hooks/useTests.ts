// lib/hooks/useTests.ts (полная версия)
import { useState, useEffect } from "react";
import {
  databases,
  COLLECTIONS,
  DATABASES,
  createDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
  getTestsByCategory,
  getTestQuestions,
  submitTestResult,
} from "../appwrite";
import {
  Test,
  Question,
  TestResult,
  TestAttemptResult,
  SubmitAnswerPayload,
} from "../types";
import { ID, Query } from "appwrite";
import { useAuth } from "@/context/AuthProvider";

export const useTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Загрузка всех тестов
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await listDocuments(COLLECTIONS.TESTS);
      setTests(response.documents as unknown as Test[]);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching tests:", error);
      setError(error.message || "Ошибка загрузки тестов");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка тестов по категории
  const fetchTestsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await getTestsByCategory(categoryId);
      setTests(response.documents as unknown as Test[]);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching tests by category:", error);
      setError(error.message || "Ошибка загрузки тестов по категории");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка вопросов для конкретного теста
  const fetchTestQuestions = async (testId: string) => {
    try {
      setLoading(true);
      const response = await getTestQuestions(testId);
      setQuestions(response.documents as unknown as Question[]);
      setError(null);
      return response.documents as unknown as Question[];
    } catch (error: any) {
      console.error("Error fetching test questions:", error);
      setError(error.message || "Ошибка загрузки вопросов теста");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Создание нового теста
  const createTest = async (
    name: string,
    description: string,
    categoryId: string
  ) => {
    try {
      if (!user) {
        throw new Error("Необходимо авторизоваться");
      }

      setLoading(true);
      const newTest = {
        name,
        description,
        categoryId,
        createdBy: user.$id!,
        createdAt: new Date().toISOString(),
      };

      const response = await createDocument(COLLECTIONS.TESTS, newTest);

      setTests((prev) => [...prev, response as unknown as Test]);
      setError(null);
      return response;
    } catch (error: any) {
      console.error("Error creating test:", error);
      setError(error.message || "Ошибка создания теста");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Обновление теста
  const updateTest = async (
    id: string,
    name: string,
    description: string,
    categoryId: string
  ) => {
    try {
      setLoading(true);
      const updatedTest = {
        name,
        description,
        categoryId,
      };

      const response = await updateDocument(COLLECTIONS.TESTS, id, updatedTest);

      setTests((prev) =>
        prev.map((test) =>
          test.$id === id ? { ...test, ...updatedTest } : test
        )
      );
      setError(null);
      return response;
    } catch (error: any) {
      console.error("Error updating test:", error);
      setError(error.message || "Ошибка обновления теста");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Удаление теста
  const deleteTest = async (id: string) => {
    try {
      setLoading(true);
      await deleteDocument(COLLECTIONS.TESTS, id);

      setTests((prev) => prev.filter((test) => test.$id !== id));
      setError(null);
    } catch (error: any) {
      console.error("Error deleting test:", error);
      setError(error.message || "Ошибка удаления теста");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Создание вопроса для теста
  const createQuestion = async (
    testId: string,
    text: string,
    options: string[],
    correctOptionIndex: number
  ) => {
    try {
      setLoading(true);
      const newQuestion = {
        testId,
        text,
        options,
        correctOptionIndex,
        createdAt: new Date().toISOString(),
      };

      const response = await createDocument(COLLECTIONS.QUESTIONS, newQuestion);

      setQuestions((prev) => [...prev, response as unknown as Question]);
      setError(null);
      return response;
    } catch (error: any) {
      console.error("Error creating question:", error);
      setError(error.message || "Ошибка создания вопроса");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Обновление вопроса
  const updateQuestion = async (
    id: string,
    text: string,
    options: string[],
    correctOptionIndex: number
  ) => {
    try {
      setLoading(true);
      const updatedQuestion = {
        text,
        options,
        correctOptionIndex,
      };

      const response = await updateDocument(
        COLLECTIONS.QUESTIONS,
        id,
        updatedQuestion
      );

      setQuestions((prev) =>
        prev.map((question) =>
          question.$id === id ? { ...question, ...updatedQuestion } : question
        )
      );
      setError(null);
      return response;
    } catch (error: any) {
      console.error("Error updating question:", error);
      setError(error.message || "Ошибка обновления вопроса");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Удаление вопроса
  const deleteQuestion = async (id: string) => {
    try {
      setLoading(true);
      await deleteDocument(COLLECTIONS.QUESTIONS, id);

      setQuestions((prev) => prev.filter((question) => question.$id !== id));
      setError(null);
    } catch (error: any) {
      console.error("Error deleting question:", error);
      setError(error.message || "Ошибка удаления вопроса");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Прохождение теста и отправка результатов
  const submitTest = async (testId: string, answers: SubmitAnswerPayload[]) => {
    try {
      if (!user) {
        throw new Error("Необходимо авторизоваться");
      }

      setLoading(true);

      // Загружаем вопросы теста
      const testQuestions = await fetchTestQuestions(testId);

      // Проверяем ответы и подсчитываем результат
      let correctAnswers = 0;

      answers.forEach((answer) => {
        const question = testQuestions.find((q) => q.$id === answer.questionId);
        if (
          question &&
          question.correctOptionIndex === answer.selectedOptionIndex
        ) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / testQuestions.length) * 100;

      // Сохраняем результат теста
      const result = await submitTestResult(user.$id!, testId, score);

      const testAttemptResult: TestAttemptResult = {
        testId,
        score,
        totalQuestions: testQuestions.length,
        correctAnswers,
        completedAt: new Date().toISOString(),
      };

      setError(null);
      return testAttemptResult;
    } catch (error: any) {
      console.error("Error submitting test:", error);
      setError(error.message || "Ошибка отправки результатов теста");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Загрузка результатов тестов пользователя
  const fetchUserTestResults = async (userId: string) => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASES.MAIN_DB,
        COLLECTIONS.TEST_RESULTS,
        [Query.equal("userId", userId)]
      );

      setResults(response.documents as unknown as TestResult[]);
      setError(null);
      return response.documents as unknown as TestResult[];
    } catch (error: any) {
      console.error("Error fetching user test results:", error);
      setError(error.message || "Ошибка загрузки результатов тестов");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Загрузка всех результатов тестов (для администратора)
  const fetchAllTestResults = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASES.MAIN_DB,
        COLLECTIONS.TEST_RESULTS
      );

      setResults(response.documents as unknown as TestResult[]);
      setError(null);
      return response.documents as unknown as TestResult[];
    } catch (error: any) {
      console.error("Error fetching all test results:", error);
      setError(error.message || "Ошибка загрузки всех результатов тестов");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    tests,
    questions,
    results,
    loading,
    error,
    fetchTests,
    fetchTestsByCategory,
    fetchTestQuestions,
    createTest,
    updateTest,
    deleteTest,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    submitTest,
    fetchUserTestResults,
    fetchAllTestResults,
  };
};
