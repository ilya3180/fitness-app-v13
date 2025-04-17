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
 * Интерфейс для календаря регулярности
 */
export interface RegularityData {
  dates: string[]; // Массив дат тренировок в формате ISO
}

/**
 * Интерфейс для достижения
 */
export interface Achievement {
  id: string;
  name: string;
  icon: string;
  date_earned: string;
}

/**
 * Интерфейс для тренировки в плане
 */
export interface PlanWorkout {
  id: string;
  date: string;
  status: string;
}

/**
 * Интерфейс для активного плана тренировок
 */
export interface ActivePlan {
  id: string;
  name: string;
  goal: string;
  level: string;
  frequency: number;
  duration: number;
  progress: number;
  workouts: PlanWorkout[];
}

/**
 * Интерфейс для создания тренировочного плана
 */
export interface CreatePlanData {
  user_id: string;
  goal: string;
  level: string;
  frequency: number;
  duration: number;
  inventory: string[];
  target_muscles: string[];
  name?: string; // Опциональное поле для названия плана
}

/**
 * Интерфейс для упражнения в тренировке
 */
export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
}

/**
 * Интерфейс для создания разовой тренировки
 */
export interface CreateWorkoutData {
  user_id: string;
  type: string;
  duration: number;
  target_muscles: string[];
  inventory: string[];
}

/**
 * Интерфейс для деталей упражнения в тренировке
 */
export interface WorkoutExerciseDetail {
  id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  actual_sets: number | null;
  actual_reps: number | null;
  actual_weight: number | null;
  status: string;
}

/**
 * Интерфейс для деталей тренировки
 */
export interface WorkoutDetails {
  id: string;
  user_id: string;
  plan_id: string | null;
  type: string;
  date: string;
  duration: number;
  calories: number | null;
  status: string;
  feedback: string | null;
  exercises: WorkoutExerciseDetail[];
}

/**
 * Интерфейс для обновления данных упражнения
 */
export interface UpdateExerciseData {
  id: string;
  actual_sets?: number;
  actual_reps?: number;
  actual_weight?: number;
  status: string;
}

/**
 * Интерфейс для обновления тренировки
 */
export interface UpdateWorkoutData {
  status: string;
  feedback?: string;
  exercises: UpdateExerciseData[];
}

/**
 * Получить статистику пользователя
 * @param userId ID пользователя
 * @returns Объект со статистикой
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Используем точный URL с параметрами
    const { data, error } = await supabase.functions.invoke(`get_stats?user_id=${userId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    if (error) {
      console.error('API ошибка при получении статистики:', error);
      throw error;
    }

    // Проверяем структуру данных
    console.log('Ответ от API stats:', data);

    if (!data) {
      console.error('Пустой ответ от сервера для stats');
      return { workouts: 0, total_time: 0, progress: 0, badges: 0 };
    }

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
    // Используем точный URL с параметрами
    const { data, error } = await supabase.functions.invoke(`get_workout_history?user_id=${userId}&limit=${limit}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    if (error) {
      console.error('API ошибка при получении истории тренировок:', error);
      throw error;
    }

    // Проверяем структуру данных
    console.log('Ответ от API history:', data);

    if (!data || !data.workouts) {
      console.error('Некорректный ответ от сервера для истории тренировок');
      return [];
    }

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

/**
 * Получить данные о регулярности тренировок (для календаря)
 * @param userId ID пользователя
 * @param startDate Начальная дата в формате ГГГГ-ММ-ДД
 * @param endDate Конечная дата в формате ГГГГ-ММ-ДД
 * @returns Массив дат, когда были тренировки
 */
export const getRegularity = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<RegularityData> => {
  try {
    // Используем точный URL с параметрами
    const { data, error } = await supabase.functions.invoke(`get_regularity?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    if (error) {
      console.error('API ошибка при получении регулярности:', error);
      throw error;
    }

    // Проверяем структуру данных
    console.log('Ответ от API regularity:', data);

    if (!data) {
      console.error('Пустой ответ от сервера для регулярности');
      return { dates: [] };
    }

    return data as RegularityData;
  } catch (error) {
    console.error('Ошибка при получении данных о регулярности:', error);
    return { dates: [] }; // Возвращаем пустой массив в случае ошибки
  }
};

/**
 * Получить достижения пользователя
 * @param userId ID пользователя
 * @returns Массив достижений
 */
export const getAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    // Используем точный URL с параметрами
    const { data, error } = await supabase.functions.invoke(`get_achievements?user_id=${userId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    if (error) {
      console.error('API ошибка при получении достижений:', error);
      throw error;
    }

    // Проверяем структуру данных
    console.log('Ответ от API achievements:', data);

    if (!data || !data.achievements) {
      console.error('Некорректный ответ от сервера для достижений');
      return [];
    }

    return data.achievements as Achievement[];
  } catch (error) {
    console.error('Ошибка при получении достижений:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
};

/**
 * Получить активный план тренировок пользователя
 * @param userId ID пользователя
 * @returns Активный план или null, если план не найден
 */
export const getActivePlan = async (userId: string): Promise<ActivePlan | null> => {
  try {
    console.log(`Запрашиваем активный план для пользователя ${userId}`);
    
    // Используем точный URL с параметрами
    const { data, error } = await supabase.functions.invoke(`get_active_plan?user_id=${userId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    if (error) {
      console.error('API ошибка при получении активного плана:', error);
      throw error;
    }
    
    // Подробное логирование
    console.log('Ответ от API для активного плана:', data);
    
    // Если нет активного плана, возвращаем null
    if (!data || !data.id) {
      console.log('Активный план не найден');
      return null;
    }

    return data as ActivePlan;
  } catch (error) {
    console.error('Ошибка при получении активного плана:', error);
    return null;
  }
};

/**
 * Создать новый план тренировок
 * @param planData Данные для создания плана
 * @returns ID созданного плана и список тренировок
 */
export const createPlan = async (planData: CreatePlanData): Promise<{ plan_id: string, workouts: PlanWorkout[] } | null> => {
  try {
    console.log('Отправляемые данные для создания плана:', planData);
    
    const { data, error } = await supabase.functions.invoke('create_plan', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: planData
    });

    if (error) {
      console.error('API ошибка при создании плана:', error);
      throw error;
    }

    console.log('Ответ от API для созданного плана:', data);
    
    if (!data || !data.plan_id) {
      console.error('Некорректный ответ от API при создании плана:', data);
      return null;
    }

    return data as { plan_id: string, workouts: PlanWorkout[] };
  } catch (error) {
    console.error('Ошибка при создании плана тренировок:', error);
    return null;
  }
};

/**
 * Создать разовую тренировку
 * @param workoutData Данные для создания тренировки
 * @returns ID созданной тренировки и список упражнений
 */
export const createWorkout = async (workoutData: CreateWorkoutData): Promise<{ workout_id: string, exercises: WorkoutExercise[] } | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('create_workout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: workoutData
    });

    if (error) throw error;

    return data as { workout_id: string, exercises: WorkoutExercise[] };
  } catch (error) {
    console.error('Ошибка при создании разовой тренировки:', error);
    return null;
  }
};

/**
 * Получить детали тренировки по ID
 * @param workoutId ID тренировки
 * @returns Детали тренировки включая упражнения
 */
export const getWorkoutDetails = async (workoutId: string): Promise<WorkoutDetails | null> => {
  try {
    // Сначала получаем данные о тренировке
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (workoutError) {
      console.error('Ошибка при получении данных тренировки:', workoutError);
      throw workoutError;
    }

    if (!workoutData) {
      console.error('Тренировка не найдена');
      return null;
    }

    // Затем получаем упражнения для этой тренировки
    interface ExerciseQueryResult {
      id: string;
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number;
      rest: number;
      actual_sets: number | null;
      actual_reps: number | null;
      actual_weight: number | null;
      status: string;
      exercises: { name: string } | null;
    }

    const { data: exercisesData, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        exercise_id,
        sets,
        reps,
        weight,
        rest,
        actual_sets,
        actual_reps,
        actual_weight,
        status,
        exercises (
          name
        )
      `)
      .eq('workout_id', workoutId);

    if (exercisesError) {
      console.error('Ошибка при получении упражнений тренировки:', exercisesError);
      throw exercisesError;
    }

    // Форматируем данные упражнений
    const exercises: WorkoutExerciseDetail[] = (exercisesData as unknown[]).map(ex => {
      const exercise = ex as any;
      return {
        id: exercise.id,
        exercise_id: exercise.exercise_id,
        name: exercise.exercises?.name || 'Неизвестное упражнение',
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        rest: exercise.rest,
        actual_sets: exercise.actual_sets,
        actual_reps: exercise.actual_reps,
        actual_weight: exercise.actual_weight,
        status: exercise.status
      };
    });

    // Собираем полные данные тренировки
    const workoutDetails: WorkoutDetails = {
      ...workoutData,
      exercises
    };

    return workoutDetails;
  } catch (error) {
    console.error('Ошибка при получении деталей тренировки:', error);
    return null;
  }
};

/**
 * Обновить статус тренировки и данные упражнений
 * @param workoutId ID тренировки
 * @param updateData Данные для обновления
 * @returns true если обновление успешно, иначе false
 */
export const updateWorkout = async (workoutId: string, updateData: UpdateWorkoutData): Promise<boolean> => {
  try {
    console.log('Обновление тренировки:', workoutId, updateData);
    
    // Начинаем транзакцию
    // 1. Обновляем тренировку
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({
        status: updateData.status,
        feedback: updateData.feedback || null
      })
      .eq('id', workoutId);

    if (workoutError) {
      console.error('Ошибка при обновлении тренировки:', workoutError);
      throw workoutError;
    }

    // 2. Обновляем упражнения
    if (updateData.exercises && updateData.exercises.length > 0) {
      for (const exercise of updateData.exercises) {
        const { error: exerciseError } = await supabase
          .from('workout_exercises')
          .update({
            actual_sets: exercise.actual_sets,
            actual_reps: exercise.actual_reps,
            actual_weight: exercise.actual_weight,
            status: exercise.status
          })
          .eq('id', exercise.id);

        if (exerciseError) {
          console.error('Ошибка при обновлении упражнения:', exerciseError);
          throw exerciseError;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Ошибка при обновлении тренировки:', error);
    return false;
  }
}; 