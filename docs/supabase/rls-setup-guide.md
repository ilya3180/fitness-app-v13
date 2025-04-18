# Настройка Row Level Security (RLS) в Supabase

Row Level Security (RLS) - это механизм безопасности, который позволяет ограничить доступ к строкам таблицы для разных пользователей. Это важная часть защиты данных в приложении FitBrutal.

## Что такое RLS?

RLS позволяет определить, какие строки таблицы могут видеть и изменять пользователи в зависимости от их учетных данных и роли. Например:
- Пользователь может видеть только свой профиль
- Пользователь может видеть и изменять только свои тренировки
- Все авторизованные пользователи могут просматривать упражнения, но не могут их изменять

## Как настроить RLS в Supabase

1. Войдите в [Supabase Dashboard](https://supabase.com/dashboard/)
2. Выберите ваш проект
3. Перейдите в раздел **SQL Editor**
4. Создайте новый запрос, нажав на кнопку **+ New query**
5. Скопируйте содержимое файла `scripts/rls-policies.sql` в окно SQL-редактора
6. Нажмите кнопку **Run** для выполнения запроса

## Проверка работы RLS

После настройки RLS вы можете проверить, что политики работают правильно:

1. Перейдите в раздел **Authentication** -> **Policies**
2. Вы увидите список всех таблиц и политик безопасности для них
3. Для каждой таблицы должны быть настроены соответствующие политики:
   - `users`: SELECT, UPDATE только для auth.uid() = id
   - `exercises`, `muscle_groups`, `exercise_muscle`: SELECT для всех авторизованных пользователей
   - `training_plans`, `workouts`, `achievements`: SELECT, INSERT, UPDATE, DELETE только для user_id = auth.uid()
   - `workout_exercises`: доступ через workouts (user_id = auth.uid())

## Тестирование RLS в приложении

1. Войдите в приложение под разными пользователями
2. Проверьте, что каждый пользователь видит только свои данные в разделах:
   - Профиль
   - Тренировки
   - Планы тренировок
   - Достижения
3. Проверьте, что все пользователи видят одинаковые данные в разделах:
   - Упражнения
   - Группы мышц

## Что делать, если RLS не работает

Если у вас возникли проблемы с RLS:

1. Проверьте, что RLS включен для всех таблиц: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Проверьте, что политики созданы правильно и синтаксис SQL-запросов верен
3. Проверьте, что в приложении используется правильный токен авторизации
4. Проверьте, что идентификатор пользователя (auth.uid()) соответствует идентификатору в таблице users

## Дополнительные ресурсы

- [Документация Supabase по RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Примеры политик RLS](https://supabase.com/docs/guides/auth/row-level-security#policies) 