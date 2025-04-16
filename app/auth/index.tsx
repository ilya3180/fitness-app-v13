import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Перенаправляем на экран входа
  return <Redirect href="/auth/login" />;
} 