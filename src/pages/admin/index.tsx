// pages/admin/index.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../lib/types";
import Layout from "../../components/common/Layout";
import { useAuth } from "@/context/AuthProvider";
// Импортируем хуки из сервисов вместо старых хуков
import { useTeachers, usePendingUsers } from "@/services/authService";
import { useTests } from "@/services/testService";
import { useCategories } from "@/services/categoryService";

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Используем React Query хуки для получения данных
  const { data: teachers = [] } = useTeachers();
  const { data: pendingTeachers = [] } = usePendingUsers();
  const { data: tests = [] } = useTests();
  const { data: categories = [] } = useCategories();

  // Проверка прав доступа
  useEffect(() => {
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

  // Вычисляем счетчики напрямую из полученных данных
  const teacherCount = teachers.length;
  const pendingTeacherCount = pendingTeachers.length;
  const testCount = tests.length;
  const categoryCount = categories.length;

  return (
    <Layout title="Панель администратора">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

        {/* Блоки статистики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Блок с общим количеством преподавателей */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Всего преподавателей</p>
                <p className="text-2xl font-bold">{teacherCount}</p>
              </div>
            </div>
          </div>

          {/* Блок с ожидающими активации */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ожидают активации</p>
                <p className="text-2xl font-bold">{pendingTeacherCount}</p>
              </div>
            </div>
          </div>

          {/* Блок с тестами */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Тесты</p>
                <p className="text-2xl font-bold">{testCount}</p>
              </div>
            </div>
          </div>

          {/* Блок с категориями */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Категории</p>
                <p className="text-2xl font-bold">{categoryCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <h2 className="text-2xl font-bold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-3">
                Активация пользователей
              </h3>
              <p className="text-gray-600 mb-4">
                {pendingTeacherCount > 0
                  ? `${pendingTeacherCount} преподавателя ожидают активации`
                  : "Нет преподавателей, ожидающих активации"}
              </p>
              <button
                onClick={() => router.push("/admin/users")}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Перейти к активации
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-3">Управление тестами</h3>
              <p className="text-gray-600 mb-4">
                Создание и редактирование тестов для оценки компетенций
              </p>
              <button
                onClick={() => router.push("/admin/tests")}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Управлять тестами
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-3">Просмотр статистики</h3>
              <p className="text-gray-600 mb-4">
                Анализ результатов тестирования преподавателей
              </p>
              <button
                onClick={() => router.push("/admin/statistics")}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Просмотреть статистику
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
