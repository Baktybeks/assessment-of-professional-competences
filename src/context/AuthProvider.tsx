// context/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
  authApi,
  GetUserResult,
} from "@/services/authService";
import { User, UserRole } from "@/lib/types";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

// Типы для контекста аутентификации
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// Создание контекста
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
};

// Провайдер контекста
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);

  // Используем React Query хуки
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Обработчик входа в систему
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await loginMutation.mutateAsync({ email, password });

      // Редирект в зависимости от роли
      const currentUser = (await authApi.getCurrentUser()) as GetUserResult;

      // Проверяем сначала, является ли результат объектом с notActivated
      if (
        currentUser &&
        typeof currentUser === "object" &&
        "notActivated" in currentUser
      ) {
        setError("Ожидайте активации вашего аккаунта администратором.");
        return;
      }

      // Теперь currentUser либо User, либо null
      if (currentUser) {
        if (currentUser.role === UserRole.ADMIN) {
          router.push("/admin");
        } else if (currentUser.role === UserRole.TEACHER) {
          router.push("/teacher");
        }
      }
    } catch (err: any) {
      console.error("Ошибка входа:", err);
      setError(err.message || "Ошибка входа в систему");
    }
  };

  // Обработчик регистрации
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    try {
      setError(null);
      // Роль уже определена в форме регистрации в зависимости от наличия админа
      await registerMutation.mutateAsync({ name, email, password, role });

      if (role === UserRole.TEACHER) {
        // Для преподавателей показываем сообщение об активации
        setError(
          "Регистрация успешна. Ожидайте активации вашего аккаунта администратором."
        );
        router.push("/login");
      } else {
        // Для администраторов выполняем вход
        await login(email, password);
      }
    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      setError(err.message || "Ошибка регистрации");
    }
  };

  // Обработчик выхода из системы
  const logout = async () => {
    try {
      setError(null);
      await logoutMutation.mutateAsync();

      // Очищаем все кеши при выходе
      queryClient.clear();

      router.push("/login");
    } catch (err: any) {
      console.error("Ошибка выхода:", err);
      setError(err.message || "Ошибка выхода из системы");
    }
  };

  // Определяем значение контекста
  const contextValue: AuthContextProps = {
    user: user && !("notActivated" in user) ? user : null,
    loading:
      isUserLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    error,
    setError,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
