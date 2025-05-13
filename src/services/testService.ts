// services/testService.ts
import { appwriteConfig } from "@/constants/appwriteConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Databases, ID, Query } from "appwrite";
import {
  Test,
  Question,
  TestResult,
  SubmitAnswerPayload,
  TestAttemptResult,
} from "@/lib/types";

// Константы для Appwrite
const {
  projectId: PROJECT_ID,
  endpoint: ENDPOINT,
  databaseId: DATABASE_ID,
  collections,
} = appwriteConfig;

// Инициализация клиента Appwrite
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

const database = new Databases(client);

// API функции для работы с тестами
export const testApi = {
  // Получить все тесты
  getAllTests: async (): Promise<Test[]> => {
    try {
      console.log("Загрузка всех тестов...");

      const result = await database.listDocuments(
        DATABASE_ID,
        collections.tests
      );

      console.log(`Получено ${result.total} тестов`);

      return result.documents as unknown as Test[];
    } catch (error) {
      console.error("Ошибка при получении списка тестов:", error);
      return [];
    }
  },

  // Получить тесты по категории
  getTestsByCategory: async (categoryId: string): Promise<Test[]> => {
    try {
      console.log(`Загрузка тестов по категории ${categoryId}...`);

      const result = await database.listDocuments(
        DATABASE_ID,
        collections.tests,
        [Query.equal("categoryId", categoryId)]
      );

      console.log(
        `Получено ${result.total} тестов для категории ${categoryId}`
      );

      return result.documents as unknown as Test[];
    } catch (error) {
      console.error(
        `Ошибка при получении тестов для категории ${categoryId}:`,
        error
      );
      return [];
    }
  },

  // Получить тест по ID
  getTestById: async (id: string): Promise<Test | null> => {
    try {
      console.log(`Получение теста с ID ${id}...`);

      const result = await database.getDocument(
        DATABASE_ID,
        collections.tests,
        id
      );

      return result as unknown as Test;
    } catch (error) {
      console.error(`Ошибка при получении теста с ID ${id}:`, error);
      return null;
    }
  },

  // Создать новый тест
  createTest: async (
    name: string,
    description: string,
    categoryId: string,
    userId: string
  ): Promise<Test> => {
    try {
      console.log(`Создание нового теста: ${name}...`);

      const testData = {
        name,
        description,
        categoryId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      const result = await database.createDocument(
        DATABASE_ID,
        collections.tests,
        ID.unique(),
        testData
      );

      console.log("Тест успешно создан:", result.$id);

      return result as unknown as Test;
    } catch (error) {
      console.error("Ошибка при создании теста:", error);
      throw error;
    }
  },

  // Обновить тест
  updateTest: async (
    id: string,
    name: string,
    description: string,
    categoryId: string
  ): Promise<Test> => {
    try {
      console.log(`Обновление теста с ID ${id}...`);

      const updatedData = {
        name,
        description,
        categoryId,
      };

      const result = await database.updateDocument(
        DATABASE_ID,
        collections.tests,
        id,
        updatedData
      );

      console.log("Тест успешно обновлен");

      return result as unknown as Test;
    } catch (error) {
      console.error(`Ошибка при обновлении теста с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить тест
  deleteTest: async (id: string): Promise<boolean> => {
    try {
      console.log(`Удаление теста с ID ${id}...`);

      await database.deleteDocument(DATABASE_ID, collections.tests, id);

      console.log("Тест успешно удален");

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении теста с ID ${id}:`, error);
      throw error;
    }
  },

  // Получить вопросы для теста
  getTestQuestions: async (testId: string): Promise<Question[]> => {
    try {
      console.log(`Загрузка вопросов для теста ${testId}...`);

      const result = await database.listDocuments(
        DATABASE_ID,
        collections.questions,
        [Query.equal("testId", testId)]
      );

      console.log(`Получено ${result.total} вопросов для теста ${testId}`);

      return result.documents as unknown as Question[];
    } catch (error) {
      console.error(
        `Ошибка при получении вопросов для теста ${testId}:`,
        error
      );
      return [];
    }
  },

  // Создать вопрос
  createQuestion: async (
    testId: string,
    text: string,
    options: string[],
    correctOptionIndex: number
  ): Promise<Question> => {
    try {
      console.log(`Создание нового вопроса для теста ${testId}...`);

      const questionData = {
        testId,
        text,
        options,
        correctOptionIndex,
        createdAt: new Date().toISOString(),
      };

      const result = await database.createDocument(
        DATABASE_ID,
        collections.questions,
        ID.unique(),
        questionData
      );

      console.log("Вопрос успешно создан:", result.$id);

      return result as unknown as Question;
    } catch (error) {
      console.error("Ошибка при создании вопроса:", error);
      throw error;
    }
  },

  // Обновить вопрос
  updateQuestion: async (
    id: string,
    text: string,
    options: string[],
    correctOptionIndex: number
  ): Promise<Question> => {
    try {
      console.log(`Обновление вопроса с ID ${id}...`);

      const updatedData = {
        text,
        options,
        correctOptionIndex,
      };

      const result = await database.updateDocument(
        DATABASE_ID,
        collections.questions,
        id,
        updatedData
      );

      console.log("Вопрос успешно обновлен");

      return result as unknown as Question;
    } catch (error) {
      console.error(`Ошибка при обновлении вопроса с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить вопрос
  deleteQuestion: async (id: string): Promise<boolean> => {
    try {
      console.log(`Удаление вопроса с ID ${id}...`);

      await database.deleteDocument(DATABASE_ID, collections.questions, id);

      console.log("Вопрос успешно удален");

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении вопроса с ID ${id}:`, error);
      throw error;
    }
  },

  // Сохранить результат теста
  submitTestResult: async (
    userId: string,
    testId: string,
    score: number
  ): Promise<TestResult> => {
    try {
      console.log(`Сохранение результата теста для пользователя ${userId}...`);

      const resultData = {
        userId,
        testId,
        score,
        completedAt: new Date().toISOString(),
      };

      const result = await database.createDocument(
        DATABASE_ID,
        collections.testResults,
        ID.unique(),
        resultData
      );

      console.log("Результат теста успешно сохранен:", result.$id);

      return result as unknown as TestResult;
    } catch (error) {
      console.error("Ошибка при сохранении результата теста:", error);
      throw error;
    }
  },

  // Получить результаты тестов пользователя
  getUserTestResults: async (userId: string): Promise<TestResult[]> => {
    try {
      console.log(`Загрузка результатов тестов для пользователя ${userId}...`);

      const result = await database.listDocuments(
        DATABASE_ID,
        collections.testResults,
        [Query.equal("userId", userId)]
      );

      console.log(
        `Получено ${result.total} результатов для пользователя ${userId}`
      );

      return result.documents as unknown as TestResult[];
    } catch (error) {
      console.error(
        `Ошибка при получении результатов тестов для пользователя ${userId}:`,
        error
      );
      return [];
    }
  },

  // Получить все результаты тестов (для администратора)
  getAllTestResults: async (): Promise<TestResult[]> => {
    try {
      console.log("Загрузка всех результатов тестов...");

      const result = await database.listDocuments(
        DATABASE_ID,
        collections.testResults
      );

      console.log(`Получено ${result.total} результатов тестов`);

      return result.documents as unknown as TestResult[];
    } catch (error) {
      console.error("Ошибка при получении всех результатов тестов:", error);
      return [];
    }
  },

  // Проверить ответы и рассчитать результат теста
  evaluateTestAnswers: async (
    testId: string,
    answers: SubmitAnswerPayload[]
  ): Promise<TestAttemptResult> => {
    try {
      console.log(`Проверка ответов для теста ${testId}...`);

      // Получаем вопросы теста
      const questions = await testApi.getTestQuestions(testId);

      // Проверяем ответы и считаем правильные
      let correctAnswers = 0;

      answers.forEach((answer) => {
        const question = questions.find((q) => q.$id === answer.questionId);
        if (
          question &&
          question.correctOptionIndex === answer.selectedOptionIndex
        ) {
          correctAnswers++;
        }
      });

      // Рассчитываем результат
      const score =
        questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

      const result: TestAttemptResult = {
        testId,
        score,
        totalQuestions: questions.length,
        correctAnswers,
        completedAt: new Date().toISOString(),
      };

      console.log("Результат теста рассчитан:", result);

      return result;
    } catch (error) {
      console.error("Ошибка при проверке ответов:", error);
      throw error;
    }
  },
};

// Ключи для React Query
export const testKeys = {
  all: ["tests"] as const,
  lists: () => [...testKeys.all, "list"] as const,
  list: (filters: string) => [...testKeys.lists(), { filters }] as const,
  byCategory: (categoryId: string) =>
    [...testKeys.lists(), "category", categoryId] as const,
  details: () => [...testKeys.all, "detail"] as const,
  detail: (id: string) => [...testKeys.details(), id] as const,
  questions: (testId: string) =>
    [...testKeys.detail(testId), "questions"] as const,
  results: () => [...testKeys.all, "results"] as const,
  userResults: (userId: string) => [...testKeys.results(), userId] as const,
  allResults: () => [...testKeys.results(), "all"] as const,
};

// React Query хуки
export const useTests = () => {
  return useQuery({
    queryKey: testKeys.lists(),
    queryFn: testApi.getAllTests,
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: testKeys.detail(id),
    queryFn: () => testApi.getTestById(id),
    enabled: !!id,
  });
};

export const useTestsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: testKeys.byCategory(categoryId),
    queryFn: () => testApi.getTestsByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const useTestQuestions = (testId: string) => {
  return useQuery({
    queryKey: testKeys.questions(testId),
    queryFn: () => testApi.getTestQuestions(testId),
    enabled: !!testId,
  });
};

export const useUserTestResults = (userId: string) => {
  return useQuery({
    queryKey: testKeys.userResults(userId),
    queryFn: () => testApi.getUserTestResults(userId),
    enabled: !!userId,
  });
};

export const useAllTestResults = () => {
  return useQuery({
    queryKey: testKeys.allResults(),
    queryFn: testApi.getAllTestResults,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      categoryId,
      userId,
    }: {
      name: string;
      description: string;
      categoryId: string;
      userId: string;
    }) => testApi.createTest(name, description, categoryId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
      categoryId,
    }: {
      id: string;
      name: string;
      description: string;
      categoryId: string;
    }) => testApi.updateTest(id, name, description, categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: testKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: testKeys.byCategory(variables.categoryId),
      });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testApi.deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      testId,
      text,
      options,
      correctOptionIndex,
    }: {
      testId: string;
      text: string;
      options: string[];
      correctOptionIndex: number;
    }) => testApi.createQuestion(testId, text, options, correctOptionIndex),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: testKeys.questions(variables.testId),
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      text,
      options,
      correctOptionIndex,
      testId,
    }: {
      id: string;
      text: string;
      options: string[];
      correctOptionIndex: number;
      testId: string;
    }) => testApi.updateQuestion(id, text, options, correctOptionIndex),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: testKeys.questions(variables.testId),
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, testId }: { id: string; testId: string }) =>
      testApi.deleteQuestion(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: testKeys.questions(variables.testId),
      });
    },
  });
};

export const useSubmitTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      testId,
      score,
    }: {
      userId: string;
      testId: string;
      score: number;
    }) => testApi.submitTestResult(userId, testId, score),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: testKeys.userResults(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: testKeys.allResults() });
    },
  });
};

export const useEvaluateTestAnswers = () => {
  return useMutation({
    mutationFn: ({
      testId,
      answers,
    }: {
      testId: string;
      answers: SubmitAnswerPayload[];
    }) => testApi.evaluateTestAnswers(testId, answers),
  });
};
