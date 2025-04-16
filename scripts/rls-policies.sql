-- RLS-политики для таблиц Supabase
-- Скрипт должен быть выполнен в SQL Editor Supabase

-- Включение RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_muscle ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 1. RLS для таблицы users: SELECT, UPDATE только для auth.uid() = id
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- 2. RLS для таблицы exercises: SELECT для всех авторизованных пользователей
CREATE POLICY "Anyone can view exercises" 
  ON exercises FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 3. RLS для таблицы muscle_groups: SELECT для всех авторизованных пользователей
CREATE POLICY "Anyone can view muscle groups" 
  ON muscle_groups FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 4. RLS для таблицы exercise_muscle: SELECT для всех авторизованных пользователей
CREATE POLICY "Anyone can view exercise-muscle relationships" 
  ON exercise_muscle FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 5. RLS для таблицы training_plans: SELECT, INSERT, UPDATE только для user_id = auth.uid()
CREATE POLICY "Users can view own training plans" 
  ON training_plans FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own training plans" 
  ON training_plans FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own training plans" 
  ON training_plans FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own training plans" 
  ON training_plans FOR DELETE 
  USING (user_id = auth.uid());

-- 6. RLS для таблицы workouts: SELECT, INSERT, UPDATE только для user_id = auth.uid()
CREATE POLICY "Users can view own workouts" 
  ON workouts FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own workouts" 
  ON workouts FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workouts" 
  ON workouts FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workouts" 
  ON workouts FOR DELETE 
  USING (user_id = auth.uid());

-- 7. RLS для таблицы workout_exercises: доступ через workouts (user_id = auth.uid())
CREATE POLICY "Users can view exercises in own workouts" 
  ON workout_exercises FOR SELECT 
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add exercises to own workouts" 
  ON workout_exercises FOR INSERT 
  WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises in own workouts" 
  ON workout_exercises FOR UPDATE 
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises from own workouts" 
  ON workout_exercises FOR DELETE 
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

-- 8. RLS для таблицы achievements: SELECT, INSERT, UPDATE только для user_id = auth.uid()
CREATE POLICY "Users can view own achievements" 
  ON achievements FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can add own achievements" 
  ON achievements FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievements" 
  ON achievements FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own achievements" 
  ON achievements FOR DELETE 
  USING (user_id = auth.uid()); 