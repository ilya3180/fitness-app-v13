import { Redirect } from 'expo-router';

export default function Index() {
  // Для тестирования CJM регистрации перенаправляем пользователя на экран входа
  return <Redirect href="/auth/login" />;
} 