// lib/hooks/useCategories.ts
import { useState, useEffect } from "react";
import {
  databases,
  COLLECTIONS,
  DATABASES,
  createDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
} from "../appwrite";
import { Category } from "../types";
import { ID, Query } from "appwrite";
import { useAuth } from "@/context/AuthProvider";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await listDocuments(COLLECTIONS.CATEGORIES);
      setCategories(response.documents as unknown as Category[]);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setError(error.message || "Ошибка загрузки категорий");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    fetchCategories();
  }, []);

  // Создание новой категории
  const createCategory = async (name: string, description: string) => {
    try {
      if (!user) {
        throw new Error("Необходимо авторизоваться");
      }

      setLoading(true);
      const newCategory = {
        name,
        description,
        createdBy: user.$id!,
        createdAt: new Date().toISOString(),
      };

      const response = await createDocument(
        COLLECTIONS.CATEGORIES,
        newCategory
      );

      setCategories((prev) => [...prev, response as unknown as Category]);
      setError(null);
      return response;
    } catch (error: any) {
      console.error("Error creating category:", error);
      setError(error.message || "Ошибка создания категории");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Обновление категории
  const updateCategory = async (
    id: string,
    name: string,
    description: string
  ) => {
    try {
      setLoading(true);
      const updatedCategory = {
        name,
        description,
      };

      const response = await updateDocument(
        COLLECTIONS.CATEGORIES,
        id,
        updatedCategory
      );

      setCategories((prev) =>
        prev.map((category) =>
          category.$id === id ? { ...category, ...updatedCategory } : category
        )
      );
      setError(null);
      return response;
    } catch (error: any) {
      console.error("Error updating category:", error);
      setError(error.message || "Ошибка обновления категории");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Удаление категории
  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await deleteDocument(COLLECTIONS.CATEGORIES, id);

      setCategories((prev) => prev.filter((category) => category.$id !== id));
      setError(null);
    } catch (error: any) {
      console.error("Error deleting category:", error);
      setError(error.message || "Ошибка удаления категории");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
