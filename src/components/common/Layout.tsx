// components/common/Layout.tsx
import React, { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthProvider";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Система оценки компетенций",
}) => {
  const { user, loading } = useAuth();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {/* Навигационная панель отображается только если пользователь авторизован */}
      {user && !loading && <Navbar />}

      <main className="container mx-auto px-4 py-6">{children}</main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} Система оценки профессиональных
            компетенций преподавателей
          </p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
