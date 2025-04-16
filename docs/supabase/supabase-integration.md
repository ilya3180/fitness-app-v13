# Интеграция с Supabase

## Обзор
FitBrutal использует [Supabase](https://supabase.com/) в качестве бэкенд-платформы. Supabase предоставляет все необходимые инструменты для создания полноценного бэкенда:

- PostgreSQL база данных
- Аутентификация и авторизация
- API для работы с базой данных
- Серверные функции (Edge Functions)
- Хранилище файлов (Buckets)

## Настройка проекта Supabase

### 1. Создание проекта
1. Зарегистрируйтесь на [Supabase](https://supabase.com/)
2. Создайте новый проект:
   - Укажите название (например, "fitbrutal")
   - Выберите регион размещения (предпочтительно близкий к основной аудитории)
   - Задайте надежный пароль для базы данных

### 2. Получение учетных данных
После создания проекта вам потребуются:
- **URL проекта** - `https://<project-id>.supabase.co`
- **anon key** - публичный API ключ для неаутентифицированных запросов
- **service_role key** - ключ с расширенными привилегиями (только для миграций и скриптов)

Эти данные можно найти в разделе Project Settings -> API -> Project API keys.

### 3. Настройка переменных окружения
Создайте в корне проекта файл `.env` и добавьте следующие переменные:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> **ВАЖНО**: Никогда не публикуйте файл `.env` в открытом репозитории и не включайте `SUPABASE_SERVICE_ROLE_KEY` в клиентский код!

## Инициализация Supabase в приложении

### 1. Установка пакетов
```bash
npm install @supabase/supabase-js
```

### 2. Создание клиента Supabase
Создайте файл `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 3. Генерация типов для базы данных
Для типобезопасности рекомендуется использовать автоматически генерируемые типы:

1. Установите инструменты:
```bash
npm install --save-dev supabase-cli
```

2. Сгенерируйте типы:
```bash
npx supabase gen types typescript --project-id <project-id> --schema public > lib/database.types.ts
```

## Настройка Row Level Security (RLS)

Supabase использует Row Level Security (RLS) PostgreSQL для обеспечения безопасности на уровне строк. Вам необходимо настроить политики для каждой таблицы.

### Пример политики RLS для таблицы `users`

```sql
-- Включаем RLS для таблицы
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения
CREATE POLICY "Users can view their own data" 
ON users 
FOR SELECT 
USING (auth.uid() = id);

-- Создаем политику для обновления
CREATE POLICY "Users can update their own data" 
ON users 
FOR UPDATE 
USING (auth.uid() = id);

-- Создаем политику для вставки
CREATE POLICY "Users can insert their own data" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);
```

### Пример политики RLS для таблицы `workouts`

```sql
-- Включаем RLS для таблицы
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения
CREATE POLICY "Users can view their own workouts" 
ON workouts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Политика для вставки
CREATE POLICY "Users can insert their own workouts" 
ON workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Политика для обновления
CREATE POLICY "Users can update their own workouts" 
ON workouts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Политика для удаления
CREATE POLICY "Users can delete their own workouts" 
ON workouts 
FOR DELETE 
USING (auth.uid() = user_id);
```

## Настройка аутентификации

### 1. Включение методов аутентификации
В Supabase Dashboard перейдите в раздел Authentication -> Providers:

1. Email/Password:
   - Включите опцию "Email Signup"
   - При необходимости настройте "Email Confirmations" (рекомендуется)

2. OAuth провайдеры (опционально):
   - Google (требуется настройка в Google Cloud Console)
   - Apple (требуется настройка в Apple Developer Portal)

### 2. Реализация регистрации и входа

```typescript
// Регистрация
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Вход
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Выход
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### 3. Сохранение токенов
Supabase SDK автоматически сохраняет токены, но для React Native можно настроить свой обработчик:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Создание Edge Functions

Edge Functions позволяют запускать серверный код без необходимости управления сервером.

### 1. Установка и настройка Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 2. Инициализация локального окружения

```bash
supabase init
```

### 3. Создание функции

```bash
supabase functions new get_stats
```

Это создаст файл `supabase/functions/get_stats/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Создаем клиент Supabase с использованием env vars
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );
  
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  
  if (!userId) {
    return new Response(
      JSON.stringify({ 
        error: { 
          message: 'Отсутствует обязательный параметр user_id',
          code: 'invalid_request',
          status: 400
        } 
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Получаем статистику
  try {
    // Количество тренировок
    const { count: workoutsCount, error: workoutsError } = await supabaseClient
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    if (workoutsError) throw workoutsError;
    
    // Общее время
    const { data: timeData, error: timeError } = await supabaseClient
      .from('workouts')
      .select('duration')
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    if (timeError) throw timeError;
    
    const totalTime = timeData.reduce((sum, workout) => sum + workout.duration, 0);
    
    // Количество бейджей
    const { count: badgesCount, error: badgesError } = await supabaseClient
      .from('achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (badgesError) throw badgesError;
    
    // Прогресс (расчет зависит от логики приложения)
    const progress = 0; // Заглушка
    
    return new Response(
      JSON.stringify({
        workouts: workoutsCount,
        total_time: totalTime,
        progress: progress,
        badges: badgesCount
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: error.message, status: 500 } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### 4. Локальное тестирование

```bash
supabase start
supabase functions serve get_stats
```

### 5. Деплой функции

```bash
supabase functions deploy get_stats
```

## Заключение

После настройки Supabase рекомендуется:

1. Регулярно обновлять типы при изменении структуры базы данных
2. Тщательно тестировать RLS политики для обеспечения безопасности
3. Использовать транзакции для сложных операций
4. Настроить мониторинг и логирование для отслеживания ошибок

**Дополнительная информация:**
- [Официальная документация Supabase](https://supabase.com/docs)
- [Примеры React Native с Supabase](https://github.com/supabase/supabase/tree/master/examples/user-management/expo-user-management)
- [Документация по Edge Functions](https://supabase.com/docs/guides/functions) 