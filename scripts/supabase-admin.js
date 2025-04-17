// Скрипт для авторизации и взаимодействия с Supabase
// Этот скрипт использует service_role ключ - будьте осторожны!
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Проверка наличия переменных окружения
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Ошибка: отсутствуют переменные окружения EXPO_PUBLIC_SUPABASE_URL или EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Инициализация клиента Supabase с service role ключом (административный доступ)
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Отображение диагностической информации
console.log('Диагностика подключения:');
console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Ключ ANON длина:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
console.log('Ключ SERVICE_ROLE длина:', process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.length || 0);

// Функция для выполнения SQL запросов напрямую
async function executeSQL(query, params = {}) {
  try {
    const { data, error } = await supabaseAdmin.rpc('pgaudit.exec_sql', { 
      query_text: query,
      params: params
    });
    
    if (error) throw error;
    console.log('Запрос выполнен успешно:');
    console.log(data);
    return data;
  } catch (error) {
    console.error('Ошибка выполнения SQL-запроса:', error);
    throw error;
  }
}

// Функция для проверки соединения
async function checkConnection() {
  try {
    console.log('Тестирование подключения к Supabase...');
    
    // Сначала проверяем простой запрос к auth API
    console.log('Проверка Auth API...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError) {
      console.error('Ошибка Auth API:', authError);
    } else {
      console.log('Auth API доступен');
    }
    
    // Затем проверяем доступ к базе данных
    console.log('Проверка Database API...');
    const { data, error } = await supabaseAdmin.from('users').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Ошибка Database API:', error);
      
      // Пробуем получить более подробную информацию о подключении
      const { data: healthCheck, error: healthError } = await supabaseAdmin.from('healthcheck').select('*').limit(1);
      
      if (healthError) {
        console.error('Ошибка проверки состояния базы данных:', healthError);
      } else {
        console.log('Статус проверки состояния:', healthCheck);
      }
      
      return false;
    }
    
    console.log('Соединение с Supabase установлено!');
    console.log(`Количество пользователей в базе: ${data}`);
    return true;
  } catch (error) {
    console.error('Ошибка подключения к Supabase:', error);
    return false;
  }
}

// Функция для фикса триггера создания пользователей
async function fixUserTrigger() {
  try {
    const fixScript = require('fs').readFileSync('./scripts/fix_user_trigger.sql', 'utf8');
    await executeSQL(fixScript);
    console.log('Триггер создания пользователей успешно обновлен!');
    return true;
  } catch (error) {
    console.error('Ошибка обновления триггера:', error);
    return false;
  }
}

// Функция для получения всех пользователей
async function getAllUsers() {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*');
    
    if (error) throw error;
    console.log('Список пользователей:');
    console.table(data);
    return data;
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return [];
  }
}

// Функция для обновления пользователя
async function updateUser(userId, userData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    console.log('Пользователь успешно обновлен:', data);
    return data;
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    throw error;
  }
}

// Выполнение команд из аргументов командной строки
const command = process.argv[2];

// Обработка команд
async function run() {
  switch (command) {
    case 'check':
      await checkConnection();
      break;
    case 'fix-trigger':
      await fixUserTrigger();
      break;
    case 'users':
      await getAllUsers();
      break;
    case 'fix-tables':
      console.log('Запуск исправления таблиц...');
      // Добавляем политику insert для users
      await executeSQL(`
        DROP POLICY IF EXISTS users_insert ON public.users;
        CREATE POLICY users_insert ON public.users FOR INSERT
          WITH CHECK (auth.uid() = id);
      `);
      // Делаем email опциональным
      await executeSQL(`ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;`);
      console.log('Исправления таблиц выполнены!');
      break;
    default:
      console.log(`
Использование: node supabase-admin.js <команда>

Доступные команды:
  check         - Проверить подключение к Supabase
  fix-trigger   - Исправить триггер создания пользователей
  users         - Получить список всех пользователей
  fix-tables    - Исправить настройки таблиц и политики
      `);
  }
}

// Запуск программы
run()
  .catch(err => console.error('Ошибка выполнения скрипта:', err))
  .finally(() => process.exit()); 