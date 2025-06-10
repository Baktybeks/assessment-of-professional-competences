// components/admin/UserActivation.tsx (обновленная версия с деактивацией)
import React, { useState } from "react";
import {
  usePendingUsers,
  useActiveUsers,
  useActivateUser,
  useDeactivateUser,
} from "@/services/authService";
import { User, UserRole } from "@/lib/types";

const UserActivation: React.FC = () => {
  const { data: inactiveUsers = [], isLoading: loadingInactive } =
    usePendingUsers();
  const { data: activeUsers = [], isLoading: loadingActive } = useActiveUsers();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();

  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inactive" | "active">("inactive");

  const handleActivateUser = async (userId: string) => {
    try {
      setSuccess(null);

      await activateUserMutation.mutateAsync(userId);

      setSuccess("Пользователь успешно активирован");

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Ошибка активации пользователя:", err);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      setSuccess(null);

      await deactivateUserMutation.mutateAsync(userId);

      setSuccess("Пользователь успешно деактивирован");

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Ошибка деактивации пользователя:", err);
    }
  };

  const isLoading = loadingInactive || loadingActive;
  const hasError = activateUserMutation.error || deactivateUserMutation.error;

  // Фильтруем активных пользователей, исключая администраторов
  const activeTeachers = activeUsers.filter(
    (user) => user.role === UserRole.TEACHER
  );

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Управление пользователями</h2>

      {/* Вкладки */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("inactive")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "inactive"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Ожидают активации
            {inactiveUsers.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {inactiveUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "active"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Активные пользователи
            {activeTeachers.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeTeachers.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Сообщения об ошибках и успехе */}
      {hasError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 fade-in"
          role="alert"
        >
          <span className="block sm:inline">
            {(activateUserMutation.error as Error)?.message ||
              (deactivateUserMutation.error as Error)?.message ||
              "Ошибка при управлении пользователем"}
          </span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 fade-in"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Загрузка пользователей...</p>
        </div>
      )}

      {/* Вкладка неактивных пользователей */}
      {activeTab === "inactive" && !isLoading && (
        <>
          {inactiveUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mt-2">
                Нет пользователей, ожидающих активации
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveUsers.map((user: User) => (
                    <tr key={user.$id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">
                        {user.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {user.email}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleActivateUser(user.$id!)}
                          disabled={
                            activateUserMutation.isPending &&
                            activateUserMutation.variables === user.$id
                          }
                          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm transition-colors duration-200 ${
                            activateUserMutation.isPending &&
                            activateUserMutation.variables === user.$id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {activateUserMutation.isPending &&
                          activateUserMutation.variables === user.$id
                            ? "Активация..."
                            : "Активировать"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Вкладка активных пользователей */}
      {activeTab === "active" && !isLoading && (
        <>
          {activeTeachers.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mt-2">Нет активных преподавателей</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeTeachers.map((user: User) => (
                    <tr key={user.$id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">
                        {user.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {user.email}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Активен
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleDeactivateUser(user.$id!)}
                          disabled={
                            deactivateUserMutation.isPending &&
                            deactivateUserMutation.variables === user.$id
                          }
                          className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm transition-colors duration-200 ${
                            deactivateUserMutation.isPending &&
                            deactivateUserMutation.variables === user.$id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {deactivateUserMutation.isPending &&
                          deactivateUserMutation.variables === user.$id
                            ? "Деактивация..."
                            : "Деактивировать"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivation;
