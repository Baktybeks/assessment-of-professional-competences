// utils/authErrorHandler.ts
export const translateAuthError = (error: any): string => {
  const errorMessage = error?.message || error?.toString() || "";
  const errorCode = error?.code;

  // Переводим основные ошибки Appwrite
  switch (errorCode) {
    case 401:
      if (errorMessage.includes("Invalid credentials")) {
        return "Неверный email или пароль. Проверьте введенные данные.";
      }
      if (errorMessage.includes("Invalid password")) {
        return "Неверный пароль. Попробуйте еще раз.";
      }
      return "Ошибка авторизации. Проверьте данные для входа.";

    case 409:
      if (errorMessage.includes("already exists")) {
        return "Пользователь с таким email уже существует.";
      }
      if (errorMessage.includes("session is active")) {
        return "У вас уже есть активная сессия.";
      }
      return "Конфликт данных. Попробуйте еще раз.";

    case 400:
      if (errorMessage.includes("Invalid email")) {
        return "Введите корректный email адрес.";
      }
      if (errorMessage.includes("Password must be")) {
        return "Пароль должен содержать не менее 8 символов.";
      }
      if (errorMessage.includes("Invalid password length")) {
        return "Пароль слишком короткий. Минимум 8 символов.";
      }
      return "Неверные данные. Проверьте введенную информацию.";

    case 404:
      if (errorMessage.includes("User not found")) {
        return "Пользователь с таким email не найден.";
      }
      return "Данные не найдены.";

    case 429:
      return "Слишком много попыток. Попробуйте позже.";

    case 500:
      return "Ошибка сервера. Попробуйте позже.";

    case 503:
      return "Сервис временно недоступен. Попробуйте позже.";

    default:
      // Обработка по тексту ошибки, если код не помог
      if (errorMessage.includes("Invalid credentials")) {
        return "Неверный email или пароль. Проверьте введенные данные.";
      }
      if (errorMessage.includes("Invalid password")) {
        return "Неверный пароль. Попробуйте еще раз.";
      }
      if (errorMessage.includes("User not found")) {
        return "Пользователь с таким email не найден.";
      }
      if (errorMessage.includes("already exists")) {
        return "Пользователь с таким email уже зарегистрирован.";
      }
      if (errorMessage.includes("Invalid email")) {
        return "Введите корректный email адрес.";
      }
      if (errorMessage.includes("Password must be")) {
        return "Пароль должен содержать не менее 8 символов.";
      }
      if (errorMessage.includes("session is active")) {
        return "У вас уже есть активная сессия.";
      }
      if (errorMessage.includes("Rate limit")) {
        return "Слишком много попыток. Попробуйте позже.";
      }
      if (errorMessage.includes("Network")) {
        return "Проблема с подключением к серверу. Проверьте интернет.";
      }

      // Если не удалось определить ошибку, возвращаем общее сообщение
      return "Произошла ошибка при выполнении операции. Попробуйте еще раз.";
  }
};
