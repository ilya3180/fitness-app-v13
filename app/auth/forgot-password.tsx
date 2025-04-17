import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import LogoBrutal from '../../components/LogoBrutal';
import BrutalInput from '../../components/ui/BrutalInput';
import BrutalButton from '../../components/ui/BrutalButton';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    // Сбрасываем сообщения
    setErrorMessage('');
    setSuccessMessage('');

    // Валидация полей
    if (!email) {
      setErrorMessage('Введите email');
      return;
    }

    // Устанавливаем состояние загрузки
    setIsLoading(true);

    try {
      // Отправка запроса на сброс пароля
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://auth/reset-password',
      });
      
      // Завершаем состояние загрузки
      setIsLoading(false);
      
      // Обработка ошибок
      if (error) {
        console.error('Ошибка сброса пароля:', error.message);
        setErrorMessage(error.message);
        return;
      }
      
      // Показываем сообщение об успехе
      setSuccessMessage('Инструкции по сбросу пароля отправлены на ваш email');
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
      <Text style={styles.heading}>СБРОС ПАРОЛЯ</Text>
      <View style={styles.divider} />

      {/* Инструкции */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          ВВЕДИТЕ EMAIL, СВЯЗАННЫЙ С ВАШЕЙ УЧЕТНОЙ ЗАПИСЬЮ, И МЫ ОТПРАВИМ ИНСТРУКЦИИ ПО СБРОСУ ПАРОЛЯ
        </Text>
      </View>

      {/* Форма сброса пароля */}
      <View style={styles.formContainer}>
        <BrutalInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="your@email.com"
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <BrutalButton
          label="Отправить инструкции"
          icon="mail-outline"
          onPress={handleResetPassword}
          disabled={isLoading}
          containerStyle={styles.resetButtonContainer}
        />
      </View>

      {/* Ссылка на вход */}
      <Link href="/auth/login" asChild>
        <Pressable style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            ВЕРНУТЬСЯ НА ЭКРАН ВХОДА
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
  instructionsContainer: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#F2F2F2',
    padding: 15,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    fontFamily: 'Helvetica',
  },
  formContainer: {
    backgroundColor: '#F2F2F2',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    marginBottom: 20,
  },
  resetButtonContainer: {
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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