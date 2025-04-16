import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LogoBrutal from '../../components/LogoBrutal';
import BrutalButton from '../../components/ui/BrutalButton';
import { Ionicons } from '@expo/vector-icons';

export default function RegistrationSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Логотип */}
      <View style={styles.logoContainer}>
        <LogoBrutal size="medium" />
        <Text style={styles.tagline}>NO PAIN. NO GAIN.</Text>
      </View>

      {/* Иконка успеха */}
      <View style={styles.successIconContainer}>
        <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
      </View>

      {/* Заголовок */}
      <Text style={styles.heading}>РЕГИСТРАЦИЯ УСПЕШНА!</Text>
      <View style={styles.divider} />

      {/* Сообщение */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          НА ВАШ EMAIL ОТПРАВЛЕНО ПИСЬМО СО ССЫЛКОЙ ДЛЯ ПОДТВЕРЖДЕНИЯ УЧЕТНОЙ ЗАПИСИ
        </Text>
        <Text style={styles.submessageText}>
          Проверьте свою почту и нажмите на ссылку для завершения регистрации
        </Text>
      </View>

      {/* Кнопки */}
      <BrutalButton
        label="Вернуться на экран входа"
        icon="log-in-outline"
        onPress={() => router.replace('/auth/login')}
        containerStyle={styles.buttonContainer}
      />
      
      <BrutalButton
        label="На главную"
        variant="outline"
        icon="home-outline"
        onPress={() => router.replace('/')}
        containerStyle={styles.secondaryButtonContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
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
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    marginTop: 20,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  divider: {
    height: 4,
    backgroundColor: '#000000',
    marginBottom: 30,
  },
  messageContainer: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#F2F2F2',
    padding: 20,
    marginBottom: 30,
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  submessageText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  buttonContainer: {
    marginBottom: 15,
  },
  secondaryButtonContainer: {
    marginBottom: 30,
  },
}); 