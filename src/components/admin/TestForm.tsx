// components/admin/TestForm.tsx
import React, { useState, useEffect } from "react";
import { useTests } from "../../lib/hooks/useTests";
import { useCategories } from "../../lib/hooks/useCategories";
import { Test, Category } from "../../lib/types";

interface TestFormProps {
  initialTest?: Test;
  onSuccess?: () => void;
}

const TestForm: React.FC<TestFormProps> = ({ initialTest, onSuccess }) => {
  const [name, setName] = useState(initialTest?.name || "");
  const [description, setDescription] = useState(
    initialTest?.description || ""
  );
  const [categoryId, setCategoryId] = useState(initialTest?.categoryId || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTest, updateTest } = useTests();
  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useCategories();

  const isEditing = !!initialTest;

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Название теста обязательно");
      return;
    }

    if (!categoryId) {
      setError("Выберите категорию");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialTest.$id) {
        await updateTest(initialTest.$id, name, description, categoryId);
      } else {
        await createTest(name, description, categoryId);
      }

      setName("");
      setDescription("");
      setCategoryId("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Редактировать тест" : "Создать новый тест"}
      </h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Название
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Название теста"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Описание
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Описание теста"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="category"
          >
            Категория
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.$id} value={category.$id}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesLoading && (
            <p className="text-sm text-gray-500 mt-1">Загрузка категорий...</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Сохранение..."
              : isEditing
              ? "Обновить тест"
              : "Создать тест"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestForm;
