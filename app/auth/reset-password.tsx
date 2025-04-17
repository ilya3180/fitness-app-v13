import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import BrutalInput from '../../components/ui/BrutalInput';
import BrutalButton from '../../components/ui/BrutalButton';
import LogoBrutal from '../../components/LogoBrutal';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  
  // Получаем параметры из URL
  const params = useLocalSearchParams();

  // Обработка отправки формы
  const handleResetPassword = async () => {
    // Сбрасываем сообщение об ошибке
    setErrorMessage('');
    
    // Валидация полей
    if (!password || !confirmPassword) {
      setErrorMessage('Заполните все поля');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }
    
    // Устанавливаем состояние загрузки
    setIsLoading(true);
    
    try {
      // Обновление пароля
      const { error } = await supabase.auth.updateUser({ password });
      
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      if (error) {
        console.error('Ошибка обновления пароля:', error.message);
        setErrorMessage(error.message);
        return;
      }
      
      // Показываем сообщение об успехе и переходим на страницу входа
      setIsSuccess(true);
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2000);
      
    } catch (error) {
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      // Обработка непредвиденных ошибок
      console.error('Непредвиденная ошибка:', error);
      setErrorMessage('Произошла ошибка. Попробуйте позже.');
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Логотип */}
      <View style={styles.logoContainer}>
        <LogoBrutal size="medium" />
        <Text style={styles.tagline}>NO PAIN. NO GAIN.</Text>
      </View>
      
      {/* Заголовок */}
      <Text style={styles.heading}>СОЗДАНИЕ НОВОГО ПАРОЛЯ</Text>
      <View style={styles.divider} />
      
      {/* Форма нового пароля */}
      <View style={styles.formContainer}>
        {isSuccess ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>ПАРОЛЬ УСПЕШНО ИЗМЕНЕН!</Text>
            <Text style={styles.redirectText}>Перенаправление на страницу входа...</Text>
          </View>
        ) : (
          <>
            <BrutalInput
              label="Новый пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Минимум 6 символов"
            />
            
            <BrutalInput
              label="Подтвердите пароль"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Введите пароль еще раз"
              containerStyle={styles.inputSpacing}
            />
            
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            
            <BrutalButton
              label="Установить новый пароль"
              icon="lock-closed-outline"
              onPress={handleResetPassword}
              disabled={isLoading}
              containerStyle={styles.buttonContainer}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'stretch',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  tagline: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    marginTop: 20,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  divider: {
    height: 4,
    backgroundColor: '#000000',
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: '#F2F2F2',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    marginBottom: 20,
  },
  inputSpacing: {
    marginTop: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  redirectText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
}); 