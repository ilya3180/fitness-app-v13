import { supabase } from './index';

/**
 * Интерфейс для статистики пользователя
 */
export interface UserStats {
  workouts: number; // Количество тренировок
  total_time: number; // Общее время в минутах
  progress: number; // Прогресс текущего плана в процентах
  badges: number; // Количество бейджей
}

/**
 * Интерфейс для тренировки в истории
 */
export interface WorkoutHistoryItem {
  id: string;
  type: string;
  date: string;
  duration: number;
  calories: number | null;
  status: string;
}

/**
 * Получить статистику пользователя
 * @param userId ID пользователя
 * @returns Объект со статистикой
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_stats', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: { user_id: userId }
    });

    if (error) throw error;

    return data as UserStats;
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    // Возвращаем пустую статистику в случае ошибки
    return { workouts: 0, total_time: 0, progress: 0, badges: 0 };
  }
};

/**
 * Получить историю тренировок пользователя
 * @param userId ID пользователя
 * @param limit Максимальное количество тренировок (по умолчанию 10)
 * @returns Массив тренировок
 */
export const getWorkoutHistory = async (
  userId: string, 
  limit: number = 10
): Promise<WorkoutHistoryItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-workout-history', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: { 
        user_id: userId,
        limit: limit
      }
    });

    if (error) throw error;

    return data.workouts as WorkoutHistoryItem[];
  } catch (error) {
    console.error('Ошибка при получении истории тренировок:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
};

/**
 * Форматирует время в часы и минуты
 * @param minutes Количество минут
 * @returns Строка в формате "Xч" или "Xч Yм"
 */
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}ч`;
  return `${hours}ч ${mins}м`;
};

/**
 * Форматирует дату тренировки относительно текущей даты
 * @param dateStr Дата в строковом формате (ISO)
 * @returns Форматированная строка (ВЧЕРА, 2 ДНЯ НАЗАД и т.д.)
 */
export const formatWorkoutDate = (dateStr: string): string => {
  const workoutDate = new Date(dateStr);
  const today = new Date();
  
  // Сбрасываем время для корректного сравнения
  today.setHours(0, 0, 0, 0);
  workoutDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - workoutDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'СЕГОДНЯ';
  if (diffDays === 1) return 'ВЧЕРА';
  if (diffDays < 7) return `${diffDays} ДН${diffDays > 4 ? 'ЕЙ' : 'Я'} НАЗАД`;
  
  // Для более старых дат возвращаем дату в формате ДД.ММ
  const day = workoutDate.getDate().toString().padStart(2, '0');
  const month = (workoutDate.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}; 