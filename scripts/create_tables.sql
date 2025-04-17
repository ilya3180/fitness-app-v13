-- Создание таблицы users (пользователи)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  goal TEXT,
  level TEXT,
  inventory JSONB DEFAULT '{}'::jsonb
);

-- Создание таблицы muscle_groups (группы мышц)
CREATE TABLE IF NOT EXISTS muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Создание таблицы exercises (упражнения)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  inventory JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  tips TEXT,
  image_url TEXT
);

-- Создание таблицы exercise_muscle (связь упражнений с группами мышц)
CREATE TABLE IF NOT EXISTS exercise_muscle (
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, muscle_group_id)
);

-- Создание таблицы training_plans (планы тренировок)
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  level TEXT,
  frequency INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  progress FLOAT DEFAULT 0
);

-- Создание таблицы workouts (тренировки)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- длительность в минутах
  calories INTEGER, -- примерное количество сожженных калорий
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  feedback TEXT -- обратная связь от пользователя после тренировки
);

-- Создание таблицы workout_exercises (упражнения в тренировке)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL, -- планируемое количество подходов
  reps INTEGER NOT NULL, -- планируемое количество повторений
  weight FLOAT, -- планируемый вес (в кг)
  rest INTEGER, -- отдых между подходами (в секундах)
  actual_sets INTEGER, -- фактическое количество подходов
  actual_reps INTEGER, -- фактическое количество повторений
  actual_weight FLOAT, -- фактический вес
  status TEXT NOT NULL DEFAULT 'pending' -- pending, completed, skipped
);

-- Создание таблицы achievements (достижения)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT, -- путь к иконке/изображению достижения
  date_earned TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Настройка прав доступа (Row Level Security - RLS)

-- Включение RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_muscle ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY users_select ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY users_update ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Политики для таблицы muscle_groups (только чтение для всех авторизованных)
CREATE POLICY muscle_groups_select ON muscle_groups FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Политики для таблицы exercises (только чтение для всех авторизованных)
CREATE POLICY exercises_select ON exercises FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Политики для таблицы exercise_muscle (только чтение для всех авторизованных)
CREATE POLICY exercise_muscle_select ON exercise_muscle FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Политики для таблицы training_plans
CREATE POLICY training_plans_select ON training_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY training_plans_insert ON training_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY training_plans_update ON training_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY training_plans_delete ON training_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Политики для таблицы workouts
CREATE POLICY workouts_select ON workouts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY workouts_insert ON workouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY workouts_update ON workouts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY workouts_delete ON workouts FOR DELETE 
  USING (auth.uid() = user_id);

-- Политики для таблицы workout_exercises
-- Доступ через связанную таблицу workouts
CREATE POLICY workout_exercises_select ON workout_exercises FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM workouts 
    WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()
  ));

CREATE POLICY workout_exercises_insert ON workout_exercises FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM workouts 
    WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()
  ));

CREATE POLICY workout_exercises_update ON workout_exercises FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM workouts 
    WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()
  ));

CREATE POLICY workout_exercises_delete ON workout_exercises FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM workouts 
    WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()
  ));

-- Политики для таблицы achievements
CREATE POLICY achievements_select ON achievements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY achievements_insert ON achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY achievements_update ON achievements FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY achievements_delete ON achievements FOR DELETE 
  USING (auth.uid() = user_id);

-- Создание триггера для автоматического создания записи в таблице users при регистрации нового пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Проверка, существует ли уже пользователь с таким ID
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Если пользователь уже существует, обновляем его данные
    UPDATE public.users 
    SET email = NEW.email, created_at = NEW.created_at
    WHERE id = NEW.id;
  ELSE
    -- Если пользователя нет, создаем новую запись
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at);
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- В случае любой ошибки логируем ее, но не прерываем выполнение
  RAISE WARNING 'Ошибка в триггере handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Перенастраиваем триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 