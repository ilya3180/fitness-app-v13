# Чек-лист для реализации бэкенда и интеграции FitBrutal с Supabase

## 0. Документация
- [x] Создать README с описанием API (эндпоинты, параметры, ответы)
- [x] Документировать структуру базы данных (таблицы, поля, RLS)
- [x] Описать процесс настройки Supabase и фронтенда для разработчиков
- [ ] Обновлять документацию в процессе разработки

## 1. Настройка Supabase
### 1.1. Инициализация проекта
- [х] Создать проект в Supabase Dashboard
- [х] Сохранить credentials (URL и API key) в `.env` файл фронтенда
- [х] Установить и настроить Supabase Client в React Native (`@supabase/supabase-js`)

### 1.2. Создание таблиц
- [x] Создать таблицу `users`:
  - Поля: `id` (uuid, PK), `email` (text), `created_at` (timestamp), `goal` (text), `level` (text), `inventory` (jsonb)
  - RLS: Доступ только к своим данным (`auth.uid() = id`)
- [x] Создать таблицу `exercises`:
  - Поля: `id` (uuid, PK), `name` (text), `type` (text), `inventory` (jsonb), `description` (text), `tips` (text), `image_url` (text)
  - RLS: Только чтение для всех авторизованных пользователей
- [x] Создать таблицу `muscle_groups`:
  - Поля: `id` (uuid, PK), `name` (text)
  - RLS: Только чтение
- [x] Создать таблицу `exercise_muscle`:
  - Поля: `exercise_id` (uuid, FK), `muscle_group_id` (uuid, FK)
  - RLS: Только чтение
- [x] Создать таблицу `training_plans`:
  - Поля: `id` (uuid, PK), `user_id` (uuid, FK), `name` (text), `goal` (text), `level` (text), `frequency` (int), `duration` (int), `created_at` (timestamp), `progress` (float)
  - RLS: Доступ только к своим планам (`user_id = auth.uid()`)
- [x] Создать таблицу `workouts`:
  - Поля: `id` (uuid, PK), `user_id` (uuid, FK), `plan_id` (uuid, FK, nullable), `type` (text), `date` (date), `duration` (int), `calories` (int, nullable), `status` (text), `feedback` (text, nullable)
  - RLS: Доступ только к своим тренировкам (`user_id = auth.uid()`)
- [x] Создать таблицу `workout_exercises`:
  - Поля: `id` (uuid, PK), `workout_id` (uuid, FK), `exercise_id` (uuid, FK), `sets` (int), `reps` (int), `weight` (float), `rest` (int), `actual_sets` (int, nullable), `actual_reps` (int, nullable), `actual_weight` (float, nullable), `status` (text)
  - RLS: Доступ через `workouts` (`user_id = auth.uid()`)
- [x] Создать таблицу `achievements`:
  - Поля: `id` (uuid, PK), `user_id` (uuid, FK), `name` (text), `icon` (text), `date_earned` (timestamp)
  - RLS: Доступ только к своим достижениям (`user_id = auth.uid()`)

### 1.3. Инициализация данных
- [x] Заполнить таблицу `muscle_groups` (10–15 записей, например, "Грудные", "Трицепс", "Ноги")
- [x] Заполнить таблицу `exercises` (50–100 упражнений с полями `name`, `type`, `inventory`, `description`, `tips`, `image_url`)
- [x] Заполнить таблицу `exercise_muscle` (связать упражнения с целевыми мышцами)
- [x] Создать тестовые данные для `achievements` (10–15 достижений, например, "5 тренировок подряд", "10 часов тренировок")

### 1.4. Настройка RLS
- [x] Настроить RLS для `users`: `SELECT`, `UPDATE` только для `auth.uid() = id`
- [x] Настроить RLS для `exercises`, `muscle_groups`, `exercise_muscle`: `SELECT` для всех авторизованных
- [x] Настроить RLS для `training_plans`, `workouts`, `achievements`: `SELECT`, `INSERT`, `UPDATE` только для `user_id = auth.uid()`
- [x] Настроить RLS для `workout_exercises`: доступ через `workouts` (`user_id = auth.uid()`)

## 2. Аутентификация
### 2.1
- [x] Настроить Supabase Auth в Dashboard (включить email + пароль, опционально Google/Apple)
### 2.2
- [x] Реализовать экран входа (email, пароль) с использованием `supabase.auth.signInWithPassword`
### 2.3
- [x] Реализовать экран регистрации (email, пароль) с использованием `supabase.auth.signUp`
### 2.4
- [x] Сохранять токен авторизации в AsyncStorage
- [x] Проверять авторизацию при запуске приложения:
  - [x] Если токен есть, загружать данные пользователя
  - [x] Если токена нет, перенаправлять на экран входа
### 2.5
- [x] Реализовать выход из аккаунта (`supabase.auth.signOut`)
### 2.6
- [ ] Добавить обработку ошибок аутентификации (например, неверный пароль, пользователь не найден)

## 3. Реализация API (Supabase Edge Functions)
### 3.1. Статистика
- [x] Создать функцию `get_stats`:
  - Запрос: `GET /stats?user_id=uuid`
  - Логика:
    - [x] Подсчитать количество тренировок (`SELECT COUNT(*) FROM workouts WHERE user_id = $1 AND status = 'completed'`)
    - [x] Подсчитать общее время (`SELECT SUM(duration) FROM workouts WHERE user_id = $1`)
    - [x] Рассчитать прогресс к цели (`COUNT(completed workouts) / total workouts in plan * 100`)
    - [x] Подсчитать бейджи (`SELECT COUNT(*) FROM achievements WHERE user_id = $1`)
  - Ответ: `{ workouts: number, total_time: number, progress: number, badges: number }`
- [x] Создать функцию `get_regularity`:
  - Запрос: `GET /regularity?user_id=uuid&start_date=date&end_date=date`
  - Логика: Получить даты тренировок и сформировать массив заполненных дней
  - Ответ: `{ dates: string[] }`

### 3.2. Тренировочные планы
- [x] Создать функцию `create_plan`:
  - Запрос: `POST /plans` с телом `{ user_id, goal, level, frequency, duration, inventory, target_muscles }`
  - Логика:
    - [x] Сохранить план в `training_plans`
    - [x] Подобрать упражнения из `exercises` с учетом `inventory`, `target_muscles`, `level`
    - [x] Создать записи в `workouts` для каждой тренировки
    - [x] Для каждой тренировки создать записи в `workout_exercises` (3–6 упражнений)
  - Ответ: `{ plan_id: uuid, workouts: { id: uuid, date: date }[] }`
- [x] Создать функцию `get_active_plan`:
  - Запрос: `GET /plans/active?user_id=uuid`
  - Логика:
    - [x] Найти последний активный план
    - [x] Подсчитать прогресс
    - [x] Получить список тренировок
  - Ответ: `{ id: uuid, name: string, progress: number, workouts: { id: uuid, date: date, status: string }[] }`

### 3.3. Тренировки
- [x] Создать функцию `create_workout` (для разовой тренировки):
  - Запрос: `POST /workouts` с телом `{ user_id, type, duration, target_muscles, inventory }`
  - Логика:
    - [x] Создать запись в `workouts` (`plan_id = null`, `status = 'planned'`)
    - [x] Подобрать 3–6 упражнений из `exercises` с учетом `type`, `inventory`, `target_muscles`
    - [x] Создать записи в `workout_exercises` с параметрами
  - Ответ: `{ workout_id: uuid, exercises: { id: uuid, name: string, sets: number, reps: number, weight: number, rest: number }[] }`
- [x] Создать функцию `update_workout`:
  - Запрос: `PATCH /workouts/:id` с телом `{ status, feedback, exercises: { id, actual_sets, actual_reps, actual_weight, status }[] }`
  - Логика:
    - [x] Обновить `workouts` (`status`, `feedback`)
    - [x] Обновить `workout_exercises` (`actual_sets`, `actual_reps`, `actual_weight`, `status`)
  - Ответ: `{ success: boolean }`
- [x] Создать функцию `get_workout_history`:
  - Запрос: `GET /workouts/history?user_id=uuid&limit=number`
  - Логика: Получить последние тренировки
  - Ответ: `{ workouts: { id: uuid, type: string, date: date, duration: number, calories: number }[] }`

### 3.4. Упражнения
- [x] Создать функцию `get_exercises`:
  - Запрос: `GET /exercises?type=string&inventory=jsonb&muscles=string[]`
  - Логика: Фильтровать упражнения по `type`, `inventory`, `muscle_groups` через `exercise_muscle`
  - Ответ: `{ exercises: { id: uuid, name: string, description: string, tips: string, image_url: string, muscles: string[] }[] }`

### 3.5. Достижения
- [x] Создать функцию `check_achievements`:
  - Запрос: `POST /achievements/check?user_id=uuid`
  - Логика:
    - [x] Проверить "5 тренировок подряд": Найти последовательные даты в `workouts`
    - [x] Проверить "10 часов тренировок": `SUM(duration) >= 600` в `workouts`
    - [x] Проверить "+20% к весу": Сравнить `actual_weight` в `workout_exercises` с начальным
    - [x] Проверить "1 месяц с нами": `CURRENT_DATE - users.created_at >= 30 days`
    - [x] Добавить новые достижения в `achievements`
  - Ответ: `{ new_achievements: { id: uuid, name: string, icon: string }[] }`
- [x] Создать функцию `get_achievements`:
  - Запрос: `GET /achievements?user_id=uuid`
  - Логика: Получить все достижения
  - Ответ: `{ achievements: { id: uuid, name: string, icon: string, date_earned: timestamp }[] }`

## 4. Интеграция с фронтендом
### 4.1. Home экран
- [x] Реализовать запрос к `get_stats` для отображения:
  - [x] Количество тренировок
  - [x] Общее время
  - [x] Прогресс к цели
  - [x] Количество бейджей
- [x] Реализовать запрос к `get_workout_history` для списка последних тренировок
- [x] Обновлять данные при каждом входе на экран

### 4.2. Activity экран
- [ ] Реализовать запрос к `get_stats` для статистики
- [ ] Реализовать запрос к `get_regularity` для календаря регулярности
- [ ] Реализовать запрос к `get_achievements` для списка достижений
- [ ] Реализовать запрос к `get_workout_history` для истории тренировок
- [ ] Добавить кэширование данных (AsyncStorage) для оффлайн-режима

### 4.3. Explore экран
- [ ] Реализовать запрос к `get_active_plan` для отображения текущего плана
- [ ] Реализовать анкету для создания плана:
  - [ ] Поля: `goal`, `level`, `frequency`, `duration`, `inventory`, `target_muscles`
  - [ ] Отправка данных в `create_plan`
- [ ] Реализовать разовую тренировку:
  - [ ] Поля: `type`, `duration`, `target_muscles`, `inventory`
  - [ ] Отправка данных в `create_workout`
- [ ] Реализовать отображение рекомендаций (заглушка, позже интегрировать с AI)

### 4.4. Workout Details экран
- [ ] Реализовать запрос к `workouts` и `workout_exercises` для отображения списка упражнений
- [ ] Реализовать обновление статуса упражнений (`update_workout`)
- [ ] Реализовать кнопки "Завершить" и "Завершить сейчас" с отправкой данных в `update_workout`

### 4.5. Exercise Detail экран
- [ ] Реализовать запрос к `exercises` и `exercise_muscle` для отображения деталей упражнения
- [ ] Реализовать ввод фактических данных (`actual_sets`, `actual_reps`, `actual_weight`)
- [ ] Реализовать кнопку "Отметить выполненным" с отправкой данных в `update_workout`

## 5. Тестирование
- [ ] Проверить аутентификацию:
  - [ ] Регистрация, вход, выход
  - [ ] Обработка ошибок (неверный пароль, пользователь не найден)
- [ ] Проверить статистику:
  - [ ] Корректность подсчетов (тренировки, время, прогресс, бейджи)
  - [ ] Обновление данных после тренировки
- [ ] Проверить тренировочные планы:
  - [ ] Создание плана через анкету
  - [ ] Отображение прогресса
  - [ ] Адаптация плана на основе фидбека
- [ ] Проверить разовые тренировки:
  - [ ] Генерация упражнений
  - [ ] Завершение тренировки
- [ ] Проверить достижения:
  - [ ] Проверка условий (5 тренировок, 10 часов, +20% веса, 1 месяц)
  - [ ] Отображение новых достижений
- [ ] Проверить календарь регулярности:
  - [ ] Корректное отображение заполненных дней
- [ ] Проверить оффлайн-режим:
  - [ ] Кэширование данных
  - [ ] Синхронизация после восстановления соединения

## 6. Оптимизация
- [ ] Добавить кэширование API-запросов (React Query или SWR)
- [ ] Настроить Sentry или Firebase Crashlytics для отслеживания ошибок
- [ ] Оптимизировать производительность запросов (индексы в Supabase)
- [ ] Проверить работу на слабых устройствах 