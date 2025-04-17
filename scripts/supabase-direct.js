// Скрипт для прямого доступа к Supabase API без использования клиентской библиотеки
require('dotenv').config();
const https = require('https');
const fs = require('fs');

// Проверка наличия переменных окружения
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Ошибка: отсутствуют переменные окружения EXPO_PUBLIC_SUPABASE_URL или EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Базовый URL для Supabase API
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL.replace('https://', '');
const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Функция для выполнения HTTP запроса к Supabase
function makeSupabaseRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    // Формируем опции запроса
    const options = {
      hostname: supabaseUrl,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    };

    // Создаем запрос
    const req = https.request(options, (res) => {
      let responseData = '';

      // Собираем данные ответа
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      // Обрабатываем завершение запроса
      res.on('end', () => {
        try {
          // Если есть данные, парсим JSON
          const parsedData = responseData ? JSON.parse(responseData) : {};
          
          // Проверяем код ответа
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              statusCode: res.statusCode,
              data: parsedData
            });
          } else {
            reject({
              statusCode: res.statusCode,
              error: parsedData
            });
          }
        } catch (error) {
          reject({
            statusCode: res.statusCode,
            error: {
              message: 'Ошибка парсинга JSON',
              details: error.message,
              raw: responseData
            }
          });
        }
      });
    });

    // Обработка ошибок запроса
    req.on('error', (error) => {
      reject({
        statusCode: 0,
        error: {
          message: 'Ошибка сетевого запроса',
          details: error.message
        }
      });
    });

    // Отправляем данные, если они есть
    if (data) {
      req.write(JSON.stringify(data));
    }

    // Завершаем запрос
    req.end();
  });
}

// Функция для проверки соединения
async function checkConnection() {
  try {
    console.log('Проверка соединения с Supabase...');
    
    // Запрос к API аутентификации
    const authResult = await makeSupabaseRequest('GET', '/auth/v1/user', null);
    console.log('Аутентификация работает:', authResult.statusCode);
    
    return true;
  } catch (error) {
    console.error('Ошибка проверки соединения:', error);
    return false;
  }
}

// Функция для применения SQL файла
async function applySqlFile(filePath) {
  try {
    console.log(`Применение SQL файла: ${filePath}...`);
    
    // Чтение содержимого файла
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Разделение на отдельные SQL-команды (приблизительно)
    const sqlCommands = sqlContent.split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`Найдено ${sqlCommands.length} SQL-команд`);
    
    // Выполнение каждой команды отдельно
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      console.log(`Выполнение команды ${i + 1}/${sqlCommands.length}...`);
      
      // Выполнение SQL через REST API
      const result = await makeSupabaseRequest('POST', '/rest/v1/rpc/execute_sql', {
        query: command
      });
      
      console.log(`Команда ${i + 1} выполнена успешно`);
    }
    
    console.log('Все SQL-команды выполнены успешно');
    return true;
  } catch (error) {
    console.error('Ошибка применения SQL файла:', error);
    return false;
  }
}

// Функция для получения списка пользователей
async function getUsers() {
  try {
    console.log('Получение списка пользователей...');
    
    // Запрос к REST API для получения пользователей
    const result = await makeSupabaseRequest('GET', '/rest/v1/users?select=*');
    
    console.log('Список пользователей:');
    console.table(result.data);
    
    return result.data;
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return [];
  }
}

// Функция для исправления триггера
async function fixTrigger() {
  return await applySqlFile('./fix_user_trigger.sql');
}

// Обработка команд из аргументов командной строки
const command = process.argv[2];

// Главная функция
async function main() {
  switch (command) {
    case 'check':
      await checkConnection();
      break;
    case 'users':
      await getUsers();
      break;
    case 'fix-trigger':
      await fixTrigger();
      break;
    default:
      console.log(`
Использование: node supabase-direct.js <команда>

Доступные команды:
  check         - Проверить подключение к Supabase
  users         - Получить список пользователей
  fix-trigger   - Исправить триггер создания пользователей
      `);
  }
}

// Запуск программы
main()
  .catch(err => console.error('Ошибка выполнения скрипта:', err))
  .finally(() => process.exit()); 