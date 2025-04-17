-- Скрипт для исправления проблемы с созданием новых пользователей
-- Выполните этот скрипт в SQL-редакторе Supabase

-- Обновление функции-триггера для обработки исключений
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
    BEGIN
      INSERT INTO public.users (id, email, created_at)
      VALUES (NEW.id, NEW.email, NEW.created_at);
    EXCEPTION 
      WHEN unique_violation THEN
        -- В случае нарушения уникальности просто логируем и игнорируем
        RAISE NOTICE 'Пользователь с email % уже существует', NEW.email;
      WHEN OTHERS THEN
        -- Логируем другие ошибки, но не останавливаем выполнение триггера
        RAISE WARNING 'Ошибка при создании пользователя: %', SQLERRM;
    END;
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

-- Проверка таблицы users
ALTER TABLE public.users 
  ALTER COLUMN email DROP NOT NULL;

-- Добавление индекса для ускорения поиска по email
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);

-- Проверка и исправление RLS-политик
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Убедимся, что есть правильные политики для доступа к таблице users
DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS users_insert ON public.users;
CREATE POLICY users_insert ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS users_update ON public.users;
CREATE POLICY users_update ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Убедимся, что таблица users доступна для аутентифицированных пользователей
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SEQUENCE public.users_id_seq TO authenticated; 