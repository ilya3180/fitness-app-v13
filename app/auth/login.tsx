import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import LogoBrutal from '../../components/LogoBrutal';
import BrutalInput from '../../components/ui/BrutalInput';
import BrutalButton from '../../components/ui/BrutalButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // Сбрасываем ошибку
    setErrorMessage('');

    // Валидация полей
    if (!email || !password) {
      setErrorMessage('Заполните все поля');
      return;
    }

    // Устанавливаем состояние загрузки
    setIsLoading(true);

    try {
      // Аутентификация пользователя через Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      // Обработка ошибок
      if (error) {
        console.error('Ошибка входа:', error.message);
        
        // Преобразование технических ошибок в понятные пользователю сообщения
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Неверный email или пароль');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Email не подтвержден. Проверьте почту');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }
      
      // Логирование успешного входа (для дебага)
      console.log('Login successful:', data);
      
      // Перенаправление на главную страницу
      router.replace('/');
    } catch (error) {
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      // Обработка непредвиденных ошибок
      console.error('Непредвиденная ошибка:', error);
      setErrorMessage('Произошла ошибка при входе. Попробуйте позже.');
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
      <Text style={styles.heading}>ВХОД</Text>
      <View style={styles.divider} />

      {/* Форма входа */}
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <BrutalButton
          label="Войти"
          icon="arrow-forward-outline"
          onPress={handleLogin}
          disabled={isLoading}
          containerStyle={styles.loginButtonContainer}
        />
      </View>

      {/* Ссылка на регистрацию */}
      <Link href="/auth/register" asChild>
        <Pressable style={styles.registerLink}>
          <Text style={styles.registerLinkText}>
            ЕЩЕ НЕТ АККАУНТА? ЗАРЕГИСТРИРОВАТЬСЯ
          </Text>
        </Pressable>
      </Link>

      {/* Кнопка сброса пароля */}
      <Link href="/auth/forgot-password" asChild>
        <Pressable style={styles.forgotPasswordLink}>
          <Text style={styles.forgotPasswordText}>
            ЗАБЫЛИ ПАРОЛЬ?
          </Text>
        </Pressable>
      </Link>

      {/* Нижняя кнопка */}
      <Pressable 
        style={styles.skipButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.skipButtonText}>
          ПРОПУСТИТЬ И ПРОДОЛЖИТЬ КАК ГОСТЬ
        </Text>
      </Pressable>
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
  loginButtonContainer: {
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  registerLink: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
    fontFamily: 'Helvetica',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
}); 