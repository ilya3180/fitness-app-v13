// Скрипт для тестирования процесса регистрации
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Проверка наличия переменных окружения
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Ошибка: отсутствуют переменные окружения EXPO_PUBLIC_SUPABASE_URL или EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Инициализация клиента Supabase с service role ключом (административный доступ)
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// Инициализация клиента Supabase с anon ключом (как обычный пользователь)
const supabaseAnon = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Генерация случайного email для тестирования
function generateRandomEmail() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `test.user+${timestamp}.${random}@example.com`;
}

// Функция для тестирования регистрации нового пользователя
async function testRegistration() {
  const testEmail = generateRandomEmail();
  const testPassword = 'Test123456!';
  const testName = 'Тестовый Пользователь';

  console.log('--------------------------------------------------');
  console.log(`Тестирование регистрации для: ${testEmail}`);
  console.log('--------------------------------------------------');

  try {
    // 1. Проверяем наличие пользователя с таким email (должно вернуть null)
    console.log('Проверка существующих пользователей...');
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', testEmail)
      .maybeSingle();
    
    if (checkError) {
      console.error('Ошибка проверки существующих пользователей:', checkError);
    } else {
      console.log('Результат проверки:', existingUser ? 'Пользователь найден (это ошибка!)' : 'Пользователь не найден (ок)');
    }

    // 2. Регистрация пользователя через anon ключ (имитация регистрации в приложении)
    console.log('\nРегистрация пользователя...');
    const { data, error } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    });

    if (error) {
      console.error('Ошибка регистрации:', error.message);
      console.error('Детали ошибки:', JSON.stringify(error));
      return;
    }

    console.log('Регистрация успешна!');
    console.log('ID пользователя:', data.user.id);
    console.log('Email пользователя:', data.user.email);

    // 3. Проверяем создание записи в таблице users
    console.log('\nПроверка создания записи в таблице users...');
    setTimeout(async () => {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (userError) {
        console.error('Ошибка получения данных пользователя:', userError);
      } else if (!userData) {
        console.error('Ошибка! Запись в таблице users не создана.');
        
        // Пробуем создать запись вручную
        console.log('\nПопытка создать запись вручную...');
        const { data: manualInsert, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString()
          })
          .select();
        
        if (insertError) {
          console.error('Ошибка ручного создания записи:', insertError);
        } else {
          console.log('Запись успешно создана вручную:', manualInsert);
        }
      } else {
        console.log('Запись в таблице users успешно создана:');
        console.log(userData);
      }
    }, 2000); // Ждем 2 секунды, чтобы триггер успел отработать
  } catch (e) {
    console.error('Непредвиденная ошибка:', e);
  }
}

// Функция для очистки тестовых пользователей
async function cleanupTestUsers() {
  try {
    console.log('Очистка тестовых пользователей...');
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .like('email', '%test.user+%');
    
    if (error) {
      console.error('Ошибка получения тестовых пользователей:', error);
      return;
    }

    console.log(`Найдено ${data.length} тестовых пользователей`);
    
    for (const user of data) {
      // Удаление из auth.users автоматически удалит из таблицы users через CASCADE
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`Ошибка удаления пользователя ${user.email}:`, deleteError);
      } else {
        console.log(`Пользователь ${user.email} успешно удален`);
      }
    }
  } catch (e) {
    console.error('Ошибка очистки тестовых пользователей:', e);
  }
}

// Обработка команд
const command = process.argv[2];

async function run() {
  switch (command) {
    case 'test':
      await testRegistration();
      break;
    case 'cleanup':
      await cleanupTestUsers();
      break;
    default:
      console.log(`
Использование: node test-registration.js <команда>

Доступные команды:
  test      - Тестирование процесса регистрации
  cleanup   - Удаление тестовых пользователей
      `);
  }
}

// Запуск программы
run()
  .catch(err => console.error('Ошибка выполнения скрипта:', err)); 