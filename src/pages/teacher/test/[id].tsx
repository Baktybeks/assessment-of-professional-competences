// pages/teacher/test/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../../lib/types";
import Layout from "../../../components/common/Layout";
import TestAttempt from "../../../components/teacher/TestAttempt";
import { useTests } from "../../../lib/hooks/useTests";
import { useAuth } from "@/context/AuthProvider";

const TestPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const { tests, fetchTests } = useTests();
  const [testName, setTestName] = useState<string>("");

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль преподавателя
    if (!loading && (!user || user.role !== UserRole.TEACHER)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Загрузка данных о тесте
  useEffect(() => {
    const loadTest = async () => {
      await fetchTests();
    };

    if (user && user.role === UserRole.TEACHER) {
      loadTest();
    }
  }, [user]);

  // Обновление заголовка теста
  useEffect(() => {
    if (id && tests.length > 0) {
      const test = tests.find((t) => t.$id === id);
      if (test) {
        setTestName(test.name);
      }
    }
  }, [id, tests]);

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

  // Если пользователь не преподаватель, не отображаем ничего (будет перенаправление)
  if (user.role !== UserRole.TEACHER) {
    return null;
  }

  if (!id) {
    return (
      <Layout title="Ошибка">
        <div className="container mx-auto px-4 py-8">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Ошибка! </strong>
            <span className="block sm:inline">
              Идентификатор теста не указан.
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={testName ? `Тест: ${testName}` : "Прохождение теста"}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {testName || "Прохождение теста"}
        </h1>

        <TestAttempt testId={id as string} />
      </div>
    </Layout>
  );
};

export default TestPage;
