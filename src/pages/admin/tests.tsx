// pages/admin/tests.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useTests,
  useDeleteTest,
  useTestQuestions,
} from "@/services/testService"; // Обновленный импорт
import { useCategories } from "@/services/categoryService";
import { UserRole, Test, Question } from "../../lib/types";
import Layout from "../../components/common/Layout";
import TestForm from "../../components/admin/TestForm";
import QuestionForm from "../../components/admin/QuestionForm";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

const TestsPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Используем React Query хуки для тестов
  const {
    data: tests = [], // Вместо tests
    isLoading: testsLoading, // Вместо loading: testsLoading
    isError: isTestsError,
    error: testsError,
    refetch: fetchTests, // Для совместимости
  } = useTests();

  // Хук для удаления теста
  const deleteTestMutation = useDeleteTest();

  // Используем хук категорий (уже обновлен)
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");

  // Хук для получения вопросов теста
  const {
    data: questions = [],
    isLoading: questionsLoading,
    refetch: fetchTestQuestions,
  } = useTestQuestions(selectedTestId);

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль администратора
    if (!loading && (!user || user.role !== UserRole.ADMIN)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      fetchTests(); // Можно оставить для обновления данных при монтировании
    }
  }, [user, fetchTests]);

  // Обновляем selectedTestId при изменении selectedTest
  useEffect(() => {
    if (selectedTest && selectedTest.$id) {
      setSelectedTestId(selectedTest.$id);
    }
  }, [selectedTest]);

  const handleCreateTest = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setIsEditModalOpen(true);
  };

  const handleDeleteTest = (test: Test) => {
    setSelectedTest(test);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTest = async () => {
    if (!selectedTest || !selectedTest.$id) return;

    try {
      setIsDeleting(true);
      // Используем мутацию удаления теста
      await deleteTestMutation.mutateAsync(selectedTest.$id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Ошибка удаления теста:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewQuestions = async (test: Test) => {
    setSelectedTest(test);
    // Обновление selectedTestId запустит загрузку вопросов через хук useTestQuestions
    try {
      await fetchTestQuestions(); // Обновит вопросы
      setIsQuestionsModalOpen(true);
    } catch (error) {
      console.error("Ошибка загрузки вопросов:", error);
    }
  };

  const handleAddQuestion = () => {
    setIsQuestionsModalOpen(false);
    setIsAddQuestionModalOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.$id === categoryId);
    return category ? category.name : "Неизвестная категория";
  };

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

  return (
    <Layout title="Управление тестами">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управление тестами</h1>
          <Button variant="primary" onClick={handleCreateTest}>
            Создать тест
          </Button>
        </div>

        {isTestsError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">
              {testsError?.message || "Произошла ошибка при загрузке тестов"}
            </span>
          </div>
        )}

        {testsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка тестов...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Тесты еще не созданы</p>
            <Button
              variant="primary"
              onClick={handleCreateTest}
              className="mt-4"
            >
              Создать первый тест
            </Button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tests.map((test) => (
                  <tr key={test.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {test.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getCategoryName(test.categoryId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md">
                        {test.description || "Нет описания"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleViewQuestions(test)}
                          isLoading={
                            questionsLoading && selectedTest?.$id === test.$id
                          }
                        >
                          Вопросы
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                        >
                          Изменить
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTest(test)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно для создания теста */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Создание нового теста"
      >
        <TestForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchTests(); // React Query автоматически обновит данные, но можно вызвать для уверенности
          }}
        />
      </Modal>

      {/* Модальное окно для редактирования теста */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактирование теста"
      >
        {selectedTest && (
          <TestForm
            initialTest={selectedTest}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchTests(); // React Query автоматически обновит данные, но можно вызвать для уверенности
            }}
          />
        )}
      </Modal>

      {/* Модальное окно для подтверждения удаления */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Подтверждение удаления"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Вы уверены, что хотите удалить тест "{selectedTest?.name}"? Это
            действие нельзя будет отменить.
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteTest}
              isLoading={isDeleting}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно для просмотра вопросов */}
      <Modal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        title={`Вопросы теста "${selectedTest?.name}"`}
        size="lg"
      >
        <div className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                У этого теста еще нет вопросов
              </p>
            </div>
          ) : (
            <div className="mb-6">
              {questions.map((question, index) => (
                <div key={question.$id} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold mb-2">
                      Вопрос {index + 1}
                    </h3>
                  </div>
                  <p className="text-gray-800 mb-4">{question.text}</p>
                  <div className="ml-6">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`mb-2 p-2 rounded ${
                          optIndex === question.correctOptionIndex
                            ? "bg-green-100 border border-green-300"
                            : ""
                        }`}
                      >
                        <span
                          className={
                            optIndex === question.correctOptionIndex
                              ? "font-bold"
                              : ""
                          }
                        >
                          {optIndex + 1}. {option}
                          {optIndex === question.correctOptionIndex &&
                            " (Правильный ответ)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button variant="primary" onClick={handleAddQuestion}>
              Добавить вопрос
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsQuestionsModalOpen(false)}
            >
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно для добавления вопроса */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={() => {
          setIsAddQuestionModalOpen(false);
          setIsQuestionsModalOpen(true);
        }}
        title="Добавление вопроса"
      >
        {selectedTest && (
          <QuestionForm
            testId={selectedTest.$id!}
            onSuccess={() => {
              setIsAddQuestionModalOpen(false);
              fetchTestQuestions(); // Вызываем рефетч для получения обновленных вопросов
              setIsQuestionsModalOpen(true);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default TestsPage;
