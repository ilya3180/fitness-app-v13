import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  // Показываем индикатор загрузки, пока проверяем статус авторизации
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  // Если пользователь авторизован, направляем на главную страницу приложения
  // В противном случае - на экран входа
  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 