// Скрипт для генерации JWT токена с правами service role
require('dotenv').config();
const fs = require('fs');

// Проверка наличия переменных окружения
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Ошибка: отсутствуют переменные окружения EXPO_PUBLIC_SUPABASE_URL или EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Извлечение данных 
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const projectRef = supabaseUrl.split('.')[0].replace('https://', '');

// Функция для генерации токена с полными правами
function generateServiceRoleToken() {
  try {
    // Используем service role ключ непосредственно
    const token = serviceRoleKey;
    
    // Выводим токен
    console.log('Используем Service Role Key для авторизации:');
    console.log(token);
    
    // Сохраняем токен во временный файл
    const tokenData = {
      token,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 час
      url: supabaseUrl,
      projectRef
    };
    
    fs.writeFileSync('.admin-token.json', JSON.stringify(tokenData, null, 2));
    console.log('Токен сохранен в файл .admin-token.json');
    
    return token;
  } catch (error) {
    console.error('Ошибка генерации токена:', error);
    return null;
  }
}

// Генерируем токен
generateServiceRoleToken(); 