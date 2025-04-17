import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import LogoBrutal from '../../components/LogoBrutal';
import BrutalInput from '../../components/ui/BrutalInput';
import BrutalButton from '../../components/ui/BrutalButton';
import { useAuth } from '../../lib/context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleRegister = async () => {
    // Сбросим предыдущие ошибки
    setErrorMessage('');

    // Валидация формы
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }

    // Проверка сложности пароля
    if (password.length < 6) {
      setErrorMessage('Пароль должен содержать не менее 6 символов');
      return;
    }

    // Начинаем процесс регистрации
    setIsLoading(true);

    try {
      // Регистрация через контекст авторизации
      const { error } = await signUp(email, password);
      
      // Завершаем загрузку
      setIsLoading(false);

      if (error) {
        console.error('Ошибка регистрации:', error.message);
        
        // Обработка типичных ошибок
        if (error.message.includes('already registered')) {
          setErrorMessage('Этот email уже зарегистрирован');
        } else if (error.message.includes('valid email')) {
          setErrorMessage('Введите корректный email');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      // Показываем сообщение об успешной регистрации
      alert('Регистрация успешна! Проверьте ваш email для подтверждения аккаунта.');
      
      // Возвращаемся на экран входа
      router.replace('/auth/login');
    } catch (error: any) {
      // Завершаем загрузку
      setIsLoading(false);
      
      // Обработка непредвиденных ошибок
      console.error('Непредвиденная ошибка:', error);
      setErrorMessage('Произошла ошибка при регистрации. Попробуйте позже.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Логотип */}
      <View style={styles.logoContainer}>
        <LogoBrutal size="large" />
        <Text style={styles.tagline}>NO PAIN. NO GAIN.</Text>
      </View>

      {/* Заголовок */}
      <Text style={styles.heading}>РЕГИСТРАЦИЯ</Text>
      <View style={styles.divider} />

      {/* Форма регистрации */}
      <View style={styles.formContainer}>
        <BrutalInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="your@email.com"
        />

        <BrutalInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          isPassword={true}
          autoCapitalize="none"
          placeholder="••••••••"
        />

        <BrutalInput
          label="Подтвердите пароль"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword={true}
          autoCapitalize="none"
          placeholder="••••••••"
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <BrutalButton
          label="Зарегистрироваться"
          icon="person-add-outline"
          onPress={handleRegister}
          disabled={isLoading}
          containerStyle={styles.registerButtonContainer}
        />
      </View>

      {/* Ссылка на вход */}
      <Link href="/auth/login" asChild>
        <Pressable style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ
          </Text>
        </Pressable>
      </Link>
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
  registerButtonContainer: {
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginLink: {
    alignSelf: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
}); 