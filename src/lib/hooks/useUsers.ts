// lib/hooks/useUsers.ts
import { useState, useEffect } from "react";
import {
  databases,
  COLLECTIONS,
  DATABASES,
  createDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
  getUsersByRole,
  getUserById,
  activateUser,
} from "../appwrite";
import { User, UserRole } from "../types";
import { Query } from "appwrite";
import { useAuth } from "@/context/AuthProvider";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  // Загрузка всех пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await listDocuments(COLLECTIONS.USERS);
      setUsers(response.documents as unknown as User[]);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка преподавателей
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await getUsersByRole(UserRole.TEACHER);
      setUsers(response.documents as unknown as User[]);
      setError(null);
      return response.documents as unknown as User[];
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      setError(error.message || "Ошибка загрузки преподавателей");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Загрузка неактивированных пользователей
  const fetchInactiveUsers = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASES.MAIN_DB,
        COLLECTIONS.USERS,
        [Query.equal("isActive", false), Query.equal("role", UserRole.TEACHER)]
      );

      setInactiveUsers(response.documents as unknown as User[]);
      setError(null);
      return response.documents as unknown as User[];
    } catch (error: any) {
      console.error("Error fetching inactive users:", error);
      setError(
        error.message || "Ошибка загрузки неактивированных пользователей"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Активация пользователя
  const activateUserById = async (userId: string) => {
    try {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        throw new Error("У вас нет прав для активации пользователей");
      }

      setLoading(true);
      await activateUser(userId);

      // Обновляем списки пользователей
      setInactiveUsers((prev) => prev.filter((user) => user.$id !== userId));
      setUsers((prev) =>
        prev.map((user) =>
          user.$id === userId ? { ...user, isActive: true } : user
        )
      );

      setError(null);
    } catch (error: any) {
      console.error("Error activating user:", error);
      setError(error.message || "Ошибка активации пользователя");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Получение пользователя по ID
  const getUserData = async (userId: string) => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      setError(null);
      return response as unknown as User;
    } catch (error: any) {
      console.error("Error getting user data:", error);
      setError(error.message || "Ошибка получения данных пользователя");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    inactiveUsers,
    loading,
    error,
    fetchUsers,
    fetchTeachers,
    fetchInactiveUsers,
    activateUserById,
    getUserData,
  };
};
