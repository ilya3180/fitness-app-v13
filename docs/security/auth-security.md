# Авторизация и безопасность

## Обзор системы авторизации
FitBrutal использует систему аутентификации Supabase, которая построена на JWT (JSON Web Tokens) и обеспечивает безопасный доступ к данным пользователей.

## Методы аутентификации

### Email/Password
Основной метод аутентификации в приложении - это стандартная аутентификация по email и паролю:

1. **Регистрация**: пользователь вводит email и пароль, система создает учетную запись и отправляет email для подтверждения.
2. **Вход**: пользователь вводит email и пароль, система проверяет учетные данные и выдает JWT токен.
3. **Восстановление пароля**: пользователь запрашивает сброс пароля, система отправляет ссылку на email.

### OAuth (опционально)
В будущих версиях приложения планируется реализация аутентификации через социальные сети:

1. **Google**: для пользователей Android и Web.
2. **Apple**: для пользователей iOS (обязательное требование Apple для приложений с аутентификацией).

## Безопасность токенов

### Хранение токенов
Токены сохраняются в AsyncStorage с использованием дополнительного уровня шифрования:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Реализация хранилища с шифрованием для iOS/Android
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Используем SecureStore для мобильных устройств и AsyncStorage для веб
const storage = Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Обновление токенов
Supabase Client автоматически обновляет токены с истекшим сроком:

1. Access Token имеет срок жизни 1 час.
2. Refresh Token имеет срок жизни 60 дней.
3. При истечении Access Token система автоматически использует Refresh Token для получения нового.

## Row Level Security (RLS)

RLS обеспечивает контроль доступа на уровне строк базы данных, позволяя пользователю видеть и редактировать только свои данные.

### Политики доступа

#### Таблица `users`
```sql
-- Пользователи могут читать только свои данные
CREATE POLICY "Users can view own data" 
ON users FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own data" 
ON users FOR UPDATE USING (auth.uid() = id);

-- Пользователи могут создавать только свои записи
CREATE POLICY "Users can insert own data" 
ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Таблица `workouts`
```sql
-- Пользователи могут читать только свои тренировки
CREATE POLICY "Users can view own workouts" 
ON workouts FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать тренировки только для себя
CREATE POLICY "Users can create own workouts" 
ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять только свои тренировки
CREATE POLICY "Users can update own workouts" 
ON workouts FOR UPDATE USING (auth.uid() = user_id);

-- Пользователи могут удалять только свои тренировки
CREATE POLICY "Users can delete own workouts" 
ON workouts FOR DELETE USING (auth.uid() = user_id);
```

## Защита API

### Валидация данных
Все входящие данные в API проходят валидацию на сервере с использованием схем Zod:

```typescript
import { z } from 'zod';

// Схема для создания тренировки
const createWorkoutSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['strength', 'cardio', 'stretch']),
  duration: z.number().min(5).max(180),
  target_muscles: z.array(z.string()).min(1),
  inventory: z.array(z.string()).optional(),
});

// Валидация данных
const validateWorkout = (data: unknown) => {
  const result = createWorkoutSchema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.format();
    throw new Error(`Validation error: ${JSON.stringify(formattedErrors)}`);
  }
  return result.data;
};
```

### CORS и защита от CSRF
Для Edge Functions настроены соответствующие заголовки безопасности:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fitbrutal.app',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработка preflight запросов
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

## Передача данных

### HTTPS
Все коммуникации между клиентом и сервером происходят по защищенному протоколу HTTPS.

### Шифрование чувствительных данных
Чувствительные данные пользователя (например, информация о здоровье) шифруются перед сохранением в базе данных:

```typescript
import * as CryptoJS from 'crypto-js';

// Шифрование данных
const encryptData = (data: any, userSecretKey: string) => {
  const jsonData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, userSecretKey).toString();
};

// Расшифровка данных
const decryptData = (encryptedData: string, userSecretKey: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, userSecretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};
```

## Лучшие практики безопасности для разработчиков

1. **Не коммитить секреты в репозиторий**:
   - Использовать .env файлы (добавленные в .gitignore)
   - Хранить секреты в защищенном хранилище (например, 1Password)

2. **Регулярное обновление зависимостей**:
   ```bash
   npm audit
   npm update
   ```

3. **Проверка кода на уязвимости**:
   ```bash
   npm install -g snyk
   snyk test
   ```

4. **Минимальные привилегии**:
   - Использовать anon key для клиентского кода
   - service_role key использовать только для миграций и скриптов

5. **Логирование событий безопасности**:
   - Настроить логирование попыток входа
   - Настроить алерты на подозрительную активность

## Управление сессиями

### Проверка авторизации при старте приложения
```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Подписываемся на изменения сессии
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Отписываемся при размонтировании
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Автоматический выход при бездействии
```typescript
const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 минут
let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    supabase.auth.signOut();
  }, INACTIVE_TIMEOUT);
};

// Сбрасываем таймер при активности пользователя
useEffect(() => {
  const events = ['touchstart', 'touchmove', 'keydown'];
  
  const handleUserActivity = () => resetInactivityTimer();
  
  events.forEach(event => {
    document.addEventListener(event, handleUserActivity);
  });
  
  // Инициализируем таймер
  resetInactivityTimer();
  
  // Очистка при размонтировании
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, handleUserActivity);
    });
    clearTimeout(inactivityTimer);
  };
}, []);
```

## Мониторинг и аудит безопасности

### Логирование событий безопасности
```typescript
const logSecurityEvent = async (event: string, details: any, userId?: string) => {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        event,
        details,
        user_id: userId,
        ip_address: clientIp,
        user_agent: userAgent
      });
      
    if (error) throw error;
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
};
```

### Регулярный аудит
Рекомендуется проводить регулярные аудиты безопасности:

1. Проверка корректности RLS политик
2. Тестирование защиты от распространенных атак (XSS, SQL инъекции)
3. Проверка обработки ошибок и исключений
4. Анализ логов и поиск подозрительной активности 