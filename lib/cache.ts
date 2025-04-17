import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для кэша
const CACHE_KEYS = {
  USER_STATS: 'cache-user-stats',
  REGULARITY: 'cache-regularity',
  ACHIEVEMENTS: 'cache-achievements',
  WORKOUT_HISTORY: 'cache-workout-history',
};

/**
 * Сохранить данные в кэше
 * @param key Ключ для сохранения
 * @param data Данные для сохранения
 * @param userId ID пользователя
 */
export const saveToCache = async (key: string, data: any, userId: string): Promise<void> => {
  try {
    const cacheKey = `${key}-${userId}`;
    const cacheData = {
      data,
      timestamp: Date.now(), // Добавляем timestamp для проверки актуальности кэша
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Ошибка при сохранении кэша ${key}:`, error);
  }
};

/**
 * Получить данные из кэша
 * @param key Ключ для получения данных
 * @param userId ID пользователя
 * @param maxAge Максимальный возраст кэша в миллисекундах (по умолчанию 1 час)
 * @returns Данные из кэша или null, если кэш устарел или отсутствует
 */
export const getFromCache = async <T>(key: string, userId: string, maxAge: number = 60 * 60 * 1000): Promise<T | null> => {
  try {
    const cacheKey = `${key}-${userId}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) return null;
    
    const { data, timestamp } = JSON.parse(cachedData);
    const now = Date.now();
    
    // Проверяем, не устарел ли кэш
    if (now - timestamp > maxAge) {
      return null;
    }
    
    return data as T;
  } catch (error) {
    console.error(`Ошибка при получении кэша ${key}:`, error);
    return null;
  }
};

/**
 * Сохранить статистику в кэше
 * @param data Данные статистики
 * @param userId ID пользователя
 */
export const cacheUserStats = async (data: any, userId: string): Promise<void> => {
  await saveToCache(CACHE_KEYS.USER_STATS, data, userId);
};

/**
 * Сохранить данные о регулярности в кэше
 * @param data Данные о регулярности
 * @param userId ID пользователя
 */
export const cacheRegularity = async (data: any, userId: string): Promise<void> => {
  await saveToCache(CACHE_KEYS.REGULARITY, data, userId);
};

/**
 * Сохранить достижения в кэше
 * @param data Достижения
 * @param userId ID пользователя
 */
export const cacheAchievements = async (data: any, userId: string): Promise<void> => {
  await saveToCache(CACHE_KEYS.ACHIEVEMENTS, data, userId);
};

/**
 * Сохранить историю тренировок в кэше
 * @param data История тренировок
 * @param userId ID пользователя
 */
export const cacheWorkoutHistory = async (data: any, userId: string): Promise<void> => {
  await saveToCache(CACHE_KEYS.WORKOUT_HISTORY, data, userId);
};

/**
 * Получить статистику из кэша
 * @param userId ID пользователя
 * @returns Данные статистики или null
 */
export const getCachedUserStats = async <T>(userId: string): Promise<T | null> => {
  return await getFromCache<T>(CACHE_KEYS.USER_STATS, userId);
};

/**
 * Получить данные о регулярности из кэша
 * @param userId ID пользователя
 * @returns Данные о регулярности или null
 */
export const getCachedRegularity = async <T>(userId: string): Promise<T | null> => {
  return await getFromCache<T>(CACHE_KEYS.REGULARITY, userId);
};

/**
 * Получить достижения из кэша
 * @param userId ID пользователя
 * @returns Достижения или null
 */
export const getCachedAchievements = async <T>(userId: string): Promise<T | null> => {
  return await getFromCache<T>(CACHE_KEYS.ACHIEVEMENTS, userId);
};

/**
 * Получить историю тренировок из кэша
 * @param userId ID пользователя
 * @returns История тренировок или null
 */
export const getCachedWorkoutHistory = async <T>(userId: string): Promise<T | null> => {
  return await getFromCache<T>(CACHE_KEYS.WORKOUT_HISTORY, userId);
}; 