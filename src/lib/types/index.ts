// lib/types/index.ts

// Роли пользователей
export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
}

// Пользователь
export interface User {
  $id?: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Категория
export interface Category {
  $id?: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

// Тест
export interface Test {
  $id?: string;
  name: string;
  description: string;
  categoryId: string;
  createdBy: string;
  createdAt: string;
}

// Вопрос
export interface Question {
  $id?: string;
  testId: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  createdAt: string;
}

// Результат теста
export interface TestResult {
  $id?: string;
  userId: string;
  testId: string;
  score: number;
  completedAt: string;
}

// Статистика по тестам
export interface TestStatistics {
  testId: string;
  testName: string;
  averageScore: number;
  passCount: number;
  totalAttempts: number;
}

// Статистика по пользователям
export interface UserStatistics {
  userId: string;
  userName: string;
  completedTests: number;
  averageScore: number;
}

// Отправка ответа на вопрос
export interface SubmitAnswerPayload {
  questionId: string;
  selectedOptionIndex: number;
}

// Результат прохождения теста
export interface TestAttemptResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

// Контекст аутентификации
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
