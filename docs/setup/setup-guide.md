# Руководство по установке и настройке

## Необходимые зависимости

Для работы с проектом FitBrutal требуются следующие инструменты:

- **Node.js** (версия 18.x или выше)
- **npm** (версия 9.x или выше)
- **Expo CLI**
- **Supabase CLI**
- **Git**

## 1. Настройка окружения

### Установка Node.js и npm
Скачайте и установите Node.js с [официального сайта](https://nodejs.org/).

### Установка Expo CLI
```bash
npm install -g expo-cli
```

### Установка Supabase CLI
```bash
npm install -g supabase
```

## 2. Клонирование репозитория

```bash
git clone https://github.com/your-org/fitbrutal.git
cd fitbrutal
```

## 3. Установка зависимостей проекта

```bash
npm install
```

## 4. Настройка окружения Supabase

### Создание проекта в Supabase

1. Зарегистрируйтесь или войдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Создайте новый проект:
   - Название проекта: `fitbrutal` (или другое на ваш выбор)
   - Пароль базы данных: создайте надежный пароль (сохраните его в безопасном месте)
   - Регион: выберите ближайший к целевой аудитории
   - Тарифный план: Start (бесплатный) или Pro (если требуется больше ресурсов)

### Настройка переменных окружения

1. В корне проекта создайте файл `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

2. Добавьте `.env` в `.gitignore`, если его там еще нет.

### Инициализация базы данных

Для инициализации базы данных используйте скрипт миграции, который создаст все необходимые таблицы и настройки RLS:

```bash
npm run db:init
```

## 5. Инициализация данных

Запустите скрипт для заполнения базовых данных (группы мышц, упражнения):

```bash
npm run db:seed
```

Этот скрипт создаст:
- Записи в таблице `muscle_groups`
- Базовый набор упражнений в таблице `exercises`
- Связи между упражнениями и группами мышц в таблице `exercise_muscle`

## 6. Настройка Edge Functions

1. Авторизуйтесь в Supabase CLI:
```bash
supabase login
```

2. Инициализируйте конфигурацию Supabase для проекта:
```bash
supabase init
```

3. Привяжите локальный проект к удаленному:
```bash
supabase link --project-ref <your-project-id>
```

4. Разверните Edge Functions:
```bash
supabase functions deploy --project-ref <your-project-id>
```

## 7. Запуск проекта

### Запуск в режиме разработки

```bash
npm start
```

Или с использованием Expo:

```bash
npx expo start
```

### Запуск на устройстве

Для iOS:
```bash
npm run ios
```

Для Android:
```bash
npm run android
```

## 8. Настройка для продакшена

### Создание билдов приложения

Для iOS:
```bash
eas build --platform ios
```

Для Android:
```bash
eas build --platform android
```

### Публикация OTA-обновлений

```bash
eas update --channel production
```

## Устранение неполадок

### Проблемы с соединением с Supabase
1. Убедитесь, что URL и ключи Supabase указаны правильно в `.env`
2. Проверьте, не блокирует ли брандмауэр соединение
3. Убедитесь, что RLS политики настроены правильно

### Ошибки установки зависимостей
1. Обновите npm: `npm install -g npm`
2. Очистите кэш npm: `npm cache clean --force`
3. Попробуйте снова: `rm -rf node_modules && npm install`

### Ошибки сборки Expo
1. Проверьте версию SDK в `app.json`
2. Убедитесь, что все нативные зависимости совместимы с используемой версией Expo
3. Проверьте логи Expo при сборке

## Дополнительные ресурсы

- [Документация Expo](https://docs.expo.dev/)
- [Документация Supabase](https://supabase.com/docs)
- [Документация React Native](https://reactnative.dev/docs/getting-started)
- [Типы Edge Functions и примеры](https://supabase.com/docs/guides/functions/examples) 