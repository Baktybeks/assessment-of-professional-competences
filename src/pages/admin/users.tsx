// pages/admin/users.tsx (обновленная версия)
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../lib/types";
import Layout from "../../components/common/Layout";
import UserActivation from "../../components/admin/UserActivation";
import { useAuth } from "@/context/AuthProvider";
import { usePendingUsers, useActiveUsers } from "@/services/authService";

const UsersPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Получаем данные для отображения статистики в заголовке
  const { data: pendingUsers = [] } = usePendingUsers();
  const { data: activeUsers = [] } = useActiveUsers();

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль администратора
    if (!loading && (!user || user.role !== UserRole.ADMIN)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Layout title="Загрузка...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Если пользователь не администратор, не отображаем ничего (будет перенаправление)
  if (user.role !== UserRole.ADMIN) {
    return null;
  }

  // Фильтруем только преподавателей из активных пользователей
  const activeTeachers = activeUsers.filter((u) => u.role === UserRole.TEACHER);

  return (
    <Layout title="Управление пользователями">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок с статистикой */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Управление пользователями</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-yellow-900">
                    Ожидают активации
                  </dt>
                  <dd className="text-2xl font-bold text-yellow-900">
                    {pendingUsers.length}
                  </dd>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-green-900">
                    Активные преподаватели
                  </dt>
                  <dd className="text-2xl font-bold text-green-900">
                    {activeTeachers.length}
                  </dd>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-blue-900">
                    Всего пользователей
                  </dt>
                  <dd className="text-2xl font-bold text-blue-900">
                    {pendingUsers.length + activeUsers.length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной компонент управления пользователями */}
        <UserActivation />

        {/* Информационное сообщение */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Информация о пользователях
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Новые преподаватели должны быть активированы администратором
                    перед первым входом
                  </li>
                  <li>
                    Деактивированные пользователи не смогут войти в систему до
                    повторной активации
                  </li>
                  <li>
                    Администраторы активируются автоматически при регистрации
                  </li>
                  <li>Деактивация не удаляет данные пользователя из системы</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;
