import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  ScrollView,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import LogoBrutal from '../../components/LogoBrutal';
import BrutalInput from '../../components/ui/BrutalInput';
import BrutalButton from '../../components/ui/BrutalButton';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // Сбрасываем ошибку
    setErrorMessage('');

    // Валидация полей
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Пароль должен содержать не менее 6 символов');
      return;
    }

    // Установка состояния загрузки
    setIsLoading(true);

    try {
      // Регистрация пользователя в Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            // Дополнительные поля профиля можно добавить здесь
          }
        }
      });
      
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      // Обработка ошибок
      if (error) {
        console.error('Ошибка регистрации:', error.message);
        setErrorMessage(error.message);
        return;
      }
      
      // Логирование успешной попытки (для дебага)
      console.log('Registration successful:', data);
      
      // Перенаправление на экран успешной регистрации
      router.replace('/auth/registration-success');
    } catch (error) {
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      // Обработка непредвиденных ошибок
      console.error('Непредвиденная ошибка:', error);
      setErrorMessage('Произошла ошибка при регистрации. Попробуйте позже.');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Логотип */}
      <View style={styles.logoContainer}>
        <LogoBrutal size="medium" />
        <Text style={styles.tagline}>NO PAIN. NO GAIN.</Text>
      </View>

      {/* Заголовок */}
      <Text style={styles.heading}>РЕГИСТРАЦИЯ</Text>
      <View style={styles.divider} />

      {/* Форма регистрации */}
      <View style={styles.formContainer}>
        <BrutalInput
          label="Имя"
          value={name}
          onChangeText={setName}
          placeholder="Введите ваше имя"
        />

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

      {/* Условия использования */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          РЕГИСТРИРУЯСЬ, ВЫ СОГЛАШАЕТЕСЬ С НАШИМИ УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ И ПОЛИТИКОЙ КОНФИДЕНЦИАЛЬНОСТИ
        </Text>
      </View>

      {/* Ссылка на вход */}
      <Link href="/auth/login" asChild>
        <Pressable style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
  termsContainer: {
    borderWidth: 3,
    borderColor: '#000000',
    padding: 15,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    fontFamily: 'Helvetica',
  },
  loginLink: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
}); 