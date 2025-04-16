# API-референс FitBrutal

Документация API для взаимодействия между фронтендом и бэкендом приложения FitBrutal. Все запросы требуют авторизации через Supabase Auth.

## Основные эндпоинты

### Статистика

#### Получение общей статистики пользователя
```
GET /stats?user_id=uuid
```

**Параметры запроса:**
- `user_id` (обязательный) - UUID пользователя

**Ответ:**
```json
{
  "workouts": 15,            // Количество завершенных тренировок
  "total_time": 720,         // Общее время тренировок (в минутах)
  "progress": 75.5,          // Прогресс к цели (в процентах)
  "badges": 5                // Количество полученных бейджей
}
```

**Коды ответа:**
- `200 OK` - Успешный запрос
- `400 Bad Request` - Отсутствует обязательный параметр user_id
- `401 Unauthorized` - Пользователь не авторизован
- `403 Forbidden` - Недостаточно прав для получения статистики другого пользователя

**Пример использования:**
```typescript
const fetchStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};
```

#### Получение регулярности тренировок
```
GET /regularity?user_id=uuid&start_date=date&end_date=date
```

**Параметры запроса:**
- `user_id` (обязательный) - UUID пользователя
- `start_date` (обязательный) - Начальная дата (формат YYYY-MM-DD)
- `end_date` (обязательный) - Конечная дата (формат YYYY-MM-DD)

**Ответ:**
```json
{
  "dates": ["2023-05-01", "2023-05-03", "2023-05-05", "2023-05-08"]
}
```

**Коды ответа:**
- `200 OK` - Успешный запрос
- `400 Bad Request` - Отсутствуют обязательные параметры
- `401 Unauthorized` - Пользователь не авторизован
- `403 Forbidden` - Недостаточно прав

### Тренировочные планы

#### Создание нового плана
```
POST /plans
```

**Тело запроса:**
```json
{
  "user_id": "uuid",
  "goal": "strength",
  "level": "intermediate",
  "frequency": 3,
  "duration": 4,
  "inventory": ["dumbbells", "bench"],
  "target_muscles": ["chest", "back", "legs"]
}
```

**Ответ:**
```json
{
  "plan_id": "uuid",
  "workouts": [
    { "id": "uuid", "date": "2023-05-10" },
    { "id": "uuid", "date": "2023-05-12" },
    { "id": "uuid", "date": "2023-05-15" }
  ]
}
```

**Коды ответа:**
- `201 Created` - План успешно создан
- `400 Bad Request` - Неверные параметры
- `401 Unauthorized` - Пользователь не авторизован

#### Получение активного плана
```
GET /plans/active?user_id=uuid
```

**Параметры запроса:**
- `user_id` (обязательный) - UUID пользователя

**Ответ:**
```json
{
  "id": "uuid",
  "name": "4-недельный план силовых тренировок",
  "progress": 35.5,
  "workouts": [
    { 
      "id": "uuid", 
      "date": "2023-05-10", 
      "status": "completed" 
    },
    { 
      "id": "uuid", 
      "date": "2023-05-12", 
      "status": "planned" 
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - Успешный запрос
- `204 No Content` - Активный план не найден
- `400 Bad Request` - Отсутствует обязательный параметр user_id
- `401 Unauthorized` - Пользователь не авторизован

### Тренировки

#### Создание разовой тренировки
```
POST /workouts
```

**Тело запроса:**
```json
{
  "user_id": "uuid",
  "type": "strength",
  "duration": 60,
  "target_muscles": ["chest", "shoulders", "triceps"],
  "inventory": ["dumbbells", "bench"]
}
```

**Ответ:**
```json
{
  "workout_id": "uuid",
  "exercises": [
    {
      "id": "uuid",
      "name": "Жим гантелей лежа",
      "sets": 3,
      "reps": 12,
      "weight": 15,
      "rest": 60
    },
    {
      "id": "uuid",
      "name": "Отжимания от скамьи",
      "sets": 3,
      "reps": 15,
      "weight": 0,
      "rest": 45
    }
  ]
}
```

**Коды ответа:**
- `201 Created` - Тренировка успешно создана
- `400 Bad Request` - Неверные параметры
- `401 Unauthorized` - Пользователь не авторизован

#### Обновление статуса тренировки
```
PATCH /workouts/:id
```

**Параметры пути:**
- `id` (обязательный) - UUID тренировки

**Тело запроса:**
```json
{
  "status": "completed",
  "feedback": "Было сложно, но справился",
  "exercises": [
    {
      "id": "uuid",
      "actual_sets": 3,
      "actual_reps": 10,
      "actual_weight": 17.5,
      "status": "completed"
    },
    {
      "id": "uuid",
      "actual_sets": 3,
      "actual_reps": 12,
      "actual_weight": 0,
      "status": "completed"
    }
  ]
}
```

**Ответ:**
```json
{
  "success": true
}
```

**Коды ответа:**
- `200 OK` - Тренировка успешно обновлена
- `400 Bad Request` - Неверные параметры
- `401 Unauthorized` - Пользователь не авторизован
- `403 Forbidden` - Недостаточно прав для обновления этой тренировки
- `404 Not Found` - Тренировка не найдена

#### Получение истории тренировок
```
GET /workouts/history?user_id=uuid&limit=10
```

**Параметры запроса:**
- `user_id` (обязательный) - UUID пользователя
- `limit` (необязательный) - Количество записей (по умолчанию 10)

**Ответ:**
```json
{
  "workouts": [
    {
      "id": "uuid",
      "type": "strength",
      "date": "2023-05-08",
      "duration": 45,
      "calories": 320
    },
    {
      "id": "uuid",
      "type": "cardio",
      "date": "2023-05-05",
      "duration": 30,
      "calories": 250
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - Успешный запрос
- `400 Bad Request` - Отсутствует обязательный параметр user_id
- `401 Unauthorized` - Пользователь не авторизован
- `403 Forbidden` - Недостаточно прав для получения истории другого пользователя

### Упражнения

#### Получение списка упражнений
```
GET /exercises?type=string&inventory=jsonb&muscles=string[]
```

**Параметры запроса:**
- `type` (необязательный) - Тип упражнения (strength, cardio, stretch)
- `inventory` (необязательный) - Доступный инвентарь в формате JSON
- `muscles` (необязательный) - Целевые группы мышц

**Ответ:**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "name": "Жим гантелей лежа",
      "description": "Лягте на скамью, держа гантели на уровне груди...",
      "tips": "Следите за тем, чтобы локти не уходили слишком далеко в стороны",
      "image_url": "https://example.com/images/dumbbell-press.jpg",
      "muscles": ["chest", "triceps", "shoulders"]
    },
    {
      "id": "uuid",
      "name": "Отжимания",
      "description": "Примите упор лежа, руки на ширине плеч...",
      "tips": "Держите тело прямым, не прогибайтесь в пояснице",
      "image_url": "https://example.com/images/pushups.jpg",
      "muscles": ["chest", "triceps", "core"]
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - Успешный запрос
- `401 Unauthorized` - Пользователь не авторизован

### Достижения

#### Проверка новых достижений
```
POST /achievements/check?user_id=uuid
```

**Параметры запроса:**
- `user_id` (обязательный) - UUID пользователя

**Ответ:**
```json
{
  "new_achievements": [
    {
      "id": "uuid",
      "name": "5 тренировок подряд",
      "icon": "streak-5"
    },
    {
      "id": "uuid",
      "name": "+20% к весу в жиме",
      "icon": "weight-progress"
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - Успешная проверка
- `400 Bad Request` - Отсутствует обязательный параметр user_id
- `401 Unauthorized` - Пользователь не авторизован
- `403 Forbidden` - Недостаточно прав

#### Получение списка достижений
```
GET /achievements?user_id=uuid
```

**Параметры запроса:**
- `user_id` (обязательный) - UUID пользователя

**Ответ:**
```json
{
  "achievements": [
    {
      "id": "uuid",
      "name": "5 тренировок подряд",
      "icon": "streak-5",
      "date_earned": "2023-05-05T12:34:56Z"
    },
    {
      "id": "uuid",
      "name": "10 часов тренировок",
      "icon": "time-10",
      "date_earned": "2023-05-01T09:12:34Z"
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - Успешный запрос
- `400 Bad Request` - Отсутствует обязательный параметр user_id
- `401 Unauthorized` - Пользователь не авторизован
- `403 Forbidden` - Недостаточно прав

## Обработка ошибок

Все API-эндпоинты возвращают ошибки в следующем формате:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Отсутствует обязательный параметр user_id",
    "status": 400
  }
}
```

## Локализация
В настоящий момент API возвращает сообщения на русском языке. В будущих версиях планируется поддержка локализации через заголовок `Accept-Language`. 