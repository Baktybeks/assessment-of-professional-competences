// pages/api/check-admins.ts
import { NextApiRequest, NextApiResponse } from "next";
import { databases, DATABASES, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Используем серверный ключ Appwrite для доступа
    const result = await databases.listDocuments(
      DATABASES.MAIN_DB,
      COLLECTIONS.USERS,
      [Query.equal("role", "admin")]
    );

    return res.status(200).json({ hasAdmin: result.total > 0 });
  } catch (error) {
    console.error("Ошибка при проверке наличия админов:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
