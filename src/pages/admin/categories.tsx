// pages/admin/categories.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCategories } from "../../lib/hooks/useCategories";
import { UserRole, Category } from "../../lib/types";
import Layout from "../../components/common/Layout";
import CategoryForm from "../../components/admin/CategoryForm";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { useAuth } from "@/context/AuthProvider";

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const {
    categories,
    fetchCategories,
    deleteCategory,
    loading: categoriesLoading,
    error,
  } = useCategories();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль администратора
    if (!loading && (!user || user.role !== UserRole.ADMIN)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      fetchCategories();
    }
  }, [user]);

  const handleCreateCategory = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!selectedCategory || !selectedCategory.$id) return;

    try {
      setIsDeleting(true);
      await deleteCategory(selectedCategory.$id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Ошибка удаления категории:", error);
    } finally {
      setIsDeleting(false);
    }
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
    <Layout title="Управление категориями">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управление категориями</h1>
          <Button variant="primary" onClick={handleCreateCategory}>
            Добавить категорию
          </Button>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {categoriesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка категорий...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Категории еще не созданы</p>
            <Button
              variant="primary"
              onClick={handleCreateCategory}
              className="mt-4"
            >
              Создать первую категорию
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
                {categories.map((category) => (
                  <tr key={category.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md">
                        {category.description || "Нет описания"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
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

      {/* Модальное окно для создания категории */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Создание новой категории"
      >
        <CategoryForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchCategories();
          }}
        />
      </Modal>

      {/* Модальное окно для редактирования категории */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактирование категории"
      >
        {selectedCategory && (
          <CategoryForm
            initialCategory={selectedCategory}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchCategories();
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
            Вы уверены, что хотите удалить категорию "{selectedCategory?.name}"?
            Это действие нельзя будет отменить.
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
              onClick={confirmDeleteCategory}
              isLoading={isDeleting}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default CategoriesPage;
