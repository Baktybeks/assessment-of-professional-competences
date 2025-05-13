export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    "https://fra.cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || "",
    categories: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES || "",
    tests: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TESTS || "",
    questions: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_QUESTIONS || "",
    testResults: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TEST_RESULTS || "",
  },
};

// Проверка наличия обязательных переменных
const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  "NEXT_PUBLIC_APPWRITE_COLLECTION_USERS",
  "NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES",
  "NEXT_PUBLIC_APPWRITE_COLLECTION_TESTS",
  "NEXT_PUBLIC_APPWRITE_COLLECTION_QUESTIONS",
  "NEXT_PUBLIC_APPWRITE_COLLECTION_TEST_RESULTS",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(", ")}`
  );
}
