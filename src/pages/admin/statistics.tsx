// pages/admin/statistics.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../lib/types";
import Layout from "../../components/common/Layout";
import StatisticsPage from "../../components/admin/StatisticsPage";
import { useAuth } from "@/context/AuthProvider";

const AdminStatistics: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

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

  return (
    <Layout title="Статистика">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Статистика тестирования</h1>

        <StatisticsPage />
      </div>
    </Layout>
  );
};

export default AdminStatistics;
