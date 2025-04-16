# Структура базы данных FitBrutal

## Обзор таблиц
База данных FitBrutal состоит из следующих основных таблиц:

1. `users` - Информация о пользователях
2. `exercises` - Справочник упражнений
3. `muscle_groups` - Справочник групп мышц
4. `exercise_muscle` - Связь между упражнениями и группами мышц
5. `training_plans` - Планы тренировок пользователей
6. `workouts` - Тренировки (как запланированные, так и выполненные)
7. `workout_exercises` - Упражнения в рамках конкретной тренировки
8. `achievements` - Достижения пользователей

## Детальная структура таблиц

### Таблица `users`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор пользователя (совпадает с auth.uid) |
| email | text | NOT NULL | Email пользователя |
| created_at | timestamp | DEFAULT now() | Дата регистрации |
| goal | text | | Цель тренировок (похудение, набор массы и т.д.) |
| level | text | | Уровень подготовки (beginner, intermediate, advanced) |
| inventory | jsonb | | Доступный инвентарь в формате JSON |

**RLS политики**:
- SELECT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`
- INSERT: `auth.uid() = id`

### Таблица `exercises`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор упражнения |
| name | text | NOT NULL | Название упражнения |
| type | text | NOT NULL | Тип упражнения (силовое, кардио, растяжка и т.д.) |
| inventory | jsonb | | Необходимый инвентарь |
| description | text | | Описание техники выполнения |
| tips | text | | Советы по выполнению |
| image_url | text | | URL изображения |

**RLS политики**:
- SELECT: `true` (доступно всем авторизованным пользователям)

### Таблица `muscle_groups`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор группы мышц |
| name | text | NOT NULL | Название группы мышц |

**RLS политики**:
- SELECT: `true` (доступно всем авторизованным пользователям)

### Таблица `exercise_muscle`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| exercise_id | uuid | FK(exercises.id) | Ссылка на упражнение |
| muscle_group_id | uuid | FK(muscle_groups.id) | Ссылка на группу мышц |

**Индексы**:
- Составной индекс (exercise_id, muscle_group_id)

**RLS политики**:
- SELECT: `true` (доступно всем авторизованным пользователям)

### Таблица `training_plans`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор плана |
| user_id | uuid | FK(users.id) | Ссылка на пользователя |
| name | text | NOT NULL | Название плана |
| goal | text | | Цель (похудение, набор массы и т.д.) |
| level | text | | Уровень сложности |
| frequency | int | | Количество тренировок в неделю |
| duration | int | | Продолжительность плана (в неделях) |
| created_at | timestamp | DEFAULT now() | Дата создания |
| progress | float | | Процент выполнения плана |

**RLS политики**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`

### Таблица `workouts`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор тренировки |
| user_id | uuid | FK(users.id) | Ссылка на пользователя |
| plan_id | uuid | FK(training_plans.id), NULL | Ссылка на план (NULL для разовых тренировок) |
| type | text | | Тип тренировки (силовая, кардио и т.д.) |
| date | date | | Дата тренировки |
| duration | int | | Продолжительность (в минутах) |
| calories | int | NULL | Расход калорий (если известно) |
| status | text | | Статус (planned, in_progress, completed, skipped) |
| feedback | text | NULL | Обратная связь от пользователя |

**RLS политики**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`

### Таблица `workout_exercises`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор |
| workout_id | uuid | FK(workouts.id) | Ссылка на тренировку |
| exercise_id | uuid | FK(exercises.id) | Ссылка на упражнение |
| sets | int | | Рекомендуемое количество подходов |
| reps | int | | Рекомендуемое количество повторений |
| weight | float | | Рекомендуемый вес |
| rest | int | | Рекомендуемый отдых между подходами (в секундах) |
| actual_sets | int | NULL | Фактическое количество подходов |
| actual_reps | int | NULL | Фактическое количество повторений |
| actual_weight | float | NULL | Фактический вес |
| status | text | | Статус (pending, completed, skipped) |

**RLS политики**:
- SELECT: через `workouts.user_id = auth.uid()`
- INSERT: через `workouts.user_id = auth.uid()`
- UPDATE: через `workouts.user_id = auth.uid()`

### Таблица `achievements`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| id | uuid | PK | Уникальный идентификатор достижения |
| user_id | uuid | FK(users.id) | Ссылка на пользователя |
| name | text | NOT NULL | Название достижения |
| icon | text | | URL или код иконки |
| date_earned | timestamp | DEFAULT now() | Дата получения |

**RLS политики**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`

## Индексы и оптимизация
- Индекс по `workouts.user_id` для быстрого поиска тренировок пользователя
- Индекс по `workouts.plan_id` для быстрого поиска тренировок в рамках плана
- Индекс по `workout_exercises.workout_id` для быстрого получения упражнений тренировки
- Индекс по `achievements.user_id` для быстрого получения достижений пользователя

## Начальные данные
- Таблица `muscle_groups` заполняется 10-15 основными группами мышц
- Таблица `exercises` заполняется базовым набором из 50-100 упражнений
- Таблица `exercise_muscle` связывает упражнения с целевыми мышцами
- Таблица `achievements` содержит шаблоны возможных достижений 