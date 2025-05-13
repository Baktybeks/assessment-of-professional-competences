// components/auth/RegisterForm.tsx
import React, { useEffect, useState } from "react";
import { UserRole } from "../../lib/types";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { databases, DATABASES, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, loading, error } = useAuth();

  useEffect(() => {
    const checkAdmins = async () => {
      try {
        setIsLoading(true);
        const result = await databases.listDocuments(
          DATABASES.MAIN_DB,
          COLLECTIONS.USERS,
          [Query.equal("role", UserRole.ADMIN)]
        );
        setHasAdmin(result.total > 0);
      } catch (err) {
        console.error("Ошибка при проверке наличия администраторов:", err);
        // Если не удалось проверить, предполагаем, что админов нет
        setHasAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationError(null);

    // Проверка паролей
    if (password !== confirmPassword) {
      setValidationError("Пароли не совпадают");
      return;
    }

    // Проверка сложности пароля
    if (password.length < 8) {
      setValidationError("Пароль должен содержать не менее 8 символов");
      return;
    }
    const userRole = hasAdmin ? role : UserRole.ADMIN;

    await register(name, email, password, userRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Регистрация в системе
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Или{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              войдите, если у вас уже есть аккаунт
            </Link>
          </p>
        </div>

        {(error || validationError) && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{validationError || error}</span>
          </div>
        )}

        {!hasAdmin && !isLoading && (
          <div
            className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              Вы будете зарегистрированы как первый администратор системы.
            </span>
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Проверка системы...</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Полное имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Пароль (минимум 8 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Подтверждение пароля
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Подтверждение пароля"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {hasAdmin && (
              <div>
                <label
                  htmlFor="role"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Роль
                </label>
                <select
                  id="role"
                  name="role"
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.TEACHER}>Преподаватель</option>
                  <option value={UserRole.ADMIN}>Администратор</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading || isLoading
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
