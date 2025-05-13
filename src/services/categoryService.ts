// services/categoryService.ts
import { appwriteConfig } from "@/constants/appwriteConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Databases, ID, Query } from "appwrite";
import { Category } from "@/lib/types";

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

// API функции для работы с категориями
export const categoryApi = {
  // Получить все категории
  getAllCategories: async (): Promise<Category[]> => {
    try {
      console.log("Загрузка всех категорий...");

      const result = await database.listDocuments(
        DATABASE_ID,
        collections.categories
      );

      console.log(`Получено ${result.total} категорий`);

      return result.documents as unknown as Category[];
    } catch (error) {
      console.error("Ошибка при получении списка категорий:", error);
      return [];
    }
  },

  // Получить категорию по ID
  getCategoryById: async (id: string): Promise<Category | null> => {
    try {
      console.log(`Получение категории с ID ${id}...`);

      const result = await database.getDocument(
        DATABASE_ID,
        collections.categories,
        id
      );

      return result as unknown as Category;
    } catch (error) {
      console.error(`Ошибка при получении категории с ID ${id}:`, error);
      return null;
    }
  },

  // Создать новую категорию
  createCategory: async (
    name: string,
    description: string,
    userId: string
  ): Promise<Category> => {
    try {
      console.log(`Создание новой категории: ${name}...`);

      const categoryData = {
        name,
        description,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      const result = await database.createDocument(
        DATABASE_ID,
        collections.categories,
        ID.unique(),
        categoryData
      );

      console.log("Категория успешно создана:", result.$id);

      return result as unknown as Category;
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
      throw error;
    }
  },

  // Обновить категорию
  updateCategory: async (
    id: string,
    name: string,
    description: string
  ): Promise<Category> => {
    try {
      console.log(`Обновление категории с ID ${id}...`);

      const updatedData = {
        name,
        description,
      };

      const result = await database.updateDocument(
        DATABASE_ID,
        collections.categories,
        id,
        updatedData
      );

      console.log("Категория успешно обновлена");

      return result as unknown as Category;
    } catch (error) {
      console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить категорию
  deleteCategory: async (id: string): Promise<boolean> => {
    try {
      console.log(`Удаление категории с ID ${id}...`);

      await database.deleteDocument(DATABASE_ID, collections.categories, id);

      console.log("Категория успешно удалена");

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении категории с ID ${id}:`, error);
      throw error;
    }
  },
};

// Ключи для React Query
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// React Query хуки
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoryApi.getAllCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      userId,
    }: {
      name: string;
      description: string;
      userId: string;
    }) => categoryApi.createCategory(name, description, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description: string;
    }) => categoryApi.updateCategory(id, name, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
