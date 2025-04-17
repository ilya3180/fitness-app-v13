// Скрипт для работы с Supabase API с использованием сгенерированного токена
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// Функция для получения сохраненного токена администратора
function getAdminToken() {
  try {
    // Проверяем, существует ли файл с токеном
    const tokenFilePath = path.join(__dirname, '.admin-token.json');
    
    if (!fs.existsSync(tokenFilePath)) {
      console.error('Файл с токеном не найден. Сначала выполните команду: npm run generate-token');
      return null;
    }
    
    // Читаем файл с токеном
    const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
    
    // Проверяем, не истек ли срок действия токена
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      console.error('Токен истек. Сгенерируйте новый токен: npm run generate-token');
      return null;
    }
    
    // Возвращаем токен
    return tokenData;
  } catch (error) {
    console.error('Ошибка получения токена:', error);
    return null;
  }
}

// Функция для выполнения HTTP запроса к Supabase
function makeSupabaseRequest(method, path, data = null) {
  const tokenData = getAdminToken();
  
  if (!tokenData) {
    return Promise.reject(new Error('Ошибка получения токена администратора'));
  }
  
  return new Promise((resolve, reject) => {
    // Извлекаем хост из URL
    const hostname = tokenData.url.replace('https://', '');
    
    // Формируем опции запроса
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': tokenData.token,
        'Authorization': `Bearer ${tokenData.token}`
      }
    };
    
    // Логируем запрос для отладки
    console.log(`Выполнение запроса: ${method} ${path}`);
    
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
    
    // Получаем аутентификационный статус
    const authResult = await makeSupabaseRequest('GET', '/auth/v1/admin/users');
    
    console.log('Соединение c Supabase Authentication API установлено!');
    console.log(`Статус: ${authResult.statusCode}`);
    console.log(`Получено ${authResult.data.length} пользователей`);
    
    // Проверяем доступ к базе данных
    const dbResult = await makeSupabaseRequest('GET', '/rest/v1/users?select=*&limit=5');
    
    console.log('Соединение c Supabase Database API установлено!');
    console.log(`Статус: ${dbResult.statusCode}`);
    console.log(`Получено ${dbResult.data.length} пользователей из таблицы users`);
    
    return true;
  } catch (error) {
    console.error('Ошибка проверки соединения:', error);
    return false;
  }
}

// Функция для получения списка пользователей
async function getUsers() {
  try {
    console.log('Получение списка пользователей...');
    
    // Получаем пользователей из Auth API
    const authUsers = await makeSupabaseRequest('GET', '/auth/v1/admin/users');
    
    console.log('Пользователи из Auth API:');
    console.log(`Всего: ${authUsers.data.length}`);
    
    authUsers.data.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
    });
    
    // Получаем пользователей из Database API
    const dbUsers = await makeSupabaseRequest('GET', '/rest/v1/users?select=*');
    
    console.log('\nПользователи из Database API:');
    console.log(`Всего: ${dbUsers.data.length}`);
    
    dbUsers.data.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
    });
    
    return {
      authUsers: authUsers.data,
      dbUsers: dbUsers.data
    };
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return {
      authUsers: [],
      dbUsers: []
    };
  }
}

// Функция для тестирования регистрации
async function testRegistration() {
  try {
    console.log('Тестирование процесса регистрации...');
    
    // Генерируем случайный email
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const email = `test.user+${timestamp}.${random}@example.com`;
    const password = 'Test123456!';
    
    console.log(`Создание тестового пользователя: ${email}`);
    
    // Создаем пользователя через Auth API
    const createResult = await makeSupabaseRequest('POST', '/auth/v1/admin/users', {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Тестовый Пользователь'
      }
    });
    
    console.log('Пользователь успешно создан:');
    console.log(`ID: ${createResult.data.id}`);
    console.log(`Email: ${createResult.data.email}`);
    
    // Проверяем, создалась ли запись в таблице users
    console.log('\nПроверка создания записи в таблице users...');
    
    setTimeout(async () => {
      try {
        const userResult = await makeSupabaseRequest('GET', `/rest/v1/users?id=eq.${createResult.data.id}`);
        
        if (userResult.data.length > 0) {
          console.log('Запись в таблице users успешно создана:');
          console.log(userResult.data[0]);
        } else {
          console.error('Ошибка! Запись в таблице users не создана.');
          
          // Пробуем создать запись вручную
          console.log('\nПопытка создать запись вручную...');
          
          const insertResult = await makeSupabaseRequest('POST', '/rest/v1/users', {
            id: createResult.data.id,
            email: createResult.data.email,
            created_at: new Date().toISOString()
          });
          
          console.log('Запись успешно создана вручную:');
          console.log(insertResult.data);
        }
      } catch (error) {
        console.error('Ошибка проверки создания записи:', error);
      }
    }, 2000); // Ждем 2 секунды, чтобы триггер успел отработать
    
    return createResult.data;
  } catch (error) {
    console.error('Ошибка тестирования регистрации:', error);
    return null;
  }
}

// Функция для очистки тестовых пользователей
async function cleanupTestUsers() {
  try {
    console.log('Очистка тестовых пользователей...');
    
    // Получаем список всех пользователей
    const users = await makeSupabaseRequest('GET', '/auth/v1/admin/users');
    
    // Фильтруем тестовых пользователей
    const testUsers = users.data.filter(user => user.email.includes('test.user+'));
    
    console.log(`Найдено ${testUsers.length} тестовых пользователей`);
    
    // Удаляем каждого тестового пользователя
    for (const user of testUsers) {
      try {
        await makeSupabaseRequest('DELETE', `/auth/v1/admin/users/${user.id}`);
        console.log(`Пользователь ${user.email} успешно удален`);
      } catch (error) {
        console.error(`Ошибка удаления пользователя ${user.email}:`, error);
      }
    }
    
    return testUsers.length;
  } catch (error) {
    console.error('Ошибка очистки тестовых пользователей:', error);
    return 0;
  }
}

// Функция для применения SQL скрипта
async function executeSqlScript(filePath) {
  try {
    console.log(`Выполнение SQL скрипта: ${filePath}...`);
    
    // Чтение содержимого файла
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Разделение на отдельные SQL-команды
    const sqlCommands = sqlContent.split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`Найдено ${sqlCommands.length} SQL-команд`);
    
    // Выполнение каждой команды отдельно
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      console.log(`Выполнение команды ${i + 1}/${sqlCommands.length}...`);
      
      try {
        // Выполняем SQL через REST API
        await makeSupabaseRequest('POST', '/rest/v1/rpc/execute_sql', {
          sql: command
        });
        
        console.log(`Команда ${i + 1} выполнена успешно`);
      } catch (error) {
        console.error(`Ошибка выполнения команды ${i + 1}:`, error);
        
        // Продолжаем выполнение следующих команд
        continue;
      }
    }
    
    console.log('Выполнение SQL скрипта завершено');
    return true;
  } catch (error) {
    console.error('Ошибка выполнения SQL скрипта:', error);
    return false;
  }
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
    case 'test-register':
      await testRegistration();
      break;
    case 'cleanup':
      await cleanupTestUsers();
      break;
    case 'fix-trigger':
      await executeSqlScript('./fix_user_trigger.sql');
      break;
    default:
      console.log(`
Использование: node supabase-api.js <команда>

Доступные команды:
  check         - Проверить подключение к Supabase
  users         - Получить список пользователей
  test-register - Протестировать процесс регистрации
  cleanup       - Удалить тестовых пользователей
  fix-trigger   - Исправить триггер создания пользователей
      `);
  }
}

// Запуск программы
main()
  .catch(err => console.error('Ошибка выполнения скрипта:', err))
  .finally(() => process.exit()); 