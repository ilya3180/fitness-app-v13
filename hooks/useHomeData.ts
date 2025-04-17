import { useState, useEffect } from 'react';
import { getUserStats, getWorkoutHistory, UserStats, WorkoutHistoryItem } from '@/lib/supabase/api';
import { useSupabaseAuth } from './useSupabase';

/**
 * Хук для получения данных для Home экрана
 * @returns Объект с данными, состояниями загрузки и функцией обновления
 */
export function useHomeData() {
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Функция для загрузки данных
  const fetchData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем статистику и историю тренировок параллельно
      const [statsData, workoutsData] = await Promise.all([
        getUserStats(user.id),
        getWorkoutHistory(user.id, 3) // Получаем только 3 последние тренировки
      ]);
      
      setStats(statsData);
      setWorkouts(workoutsData);
    } catch (err) {
      console.error('Ошибка при загрузке данных для Home экрана:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента или изменении user.id
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  return {
    stats,
    workouts,
    loading,
    error,
    refetch: fetchData
  };
} 