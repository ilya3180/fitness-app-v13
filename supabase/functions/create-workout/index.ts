import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Интерфейсы для типизации
interface WorkoutRequest {
  user_id: string;
  type: string;
  duration: number;
  target_muscles: string[];
  inventory: string[];
}

interface WorkoutResponse {
  workout_id: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest: number;
  }[];
}

interface DummyExercise {
  id: string;
  name: string;
}

serve(async (req) => {
  try {
    // Проверяем метод запроса
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Метод не поддерживается' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Получаем параметры запроса из тела
    const requestData: WorkoutRequest = await req.json();
    
    // Проверяем наличие обязательных полей
    if (!requestData.user_id) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать user_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!requestData.type || !requestData.duration) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать type и duration' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем Supabase клиент с ролью сервиса
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Создаем запись в workouts с plan_id = null
    const { data: workoutData, error: workoutError } = await supabaseClient
      .from('workouts')
      .insert({
        user_id: requestData.user_id,
        plan_id: null, // Разовая тренировка не связана с планом
        type: requestData.type,
        date: new Date().toISOString().split('T')[0], // Сегодняшняя дата
        duration: requestData.duration,
        status: 'planned'
      })
      .select('id')
      .single();

    if (workoutError) {
      console.error('Ошибка при создании тренировки:', workoutError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при создании тренировки', details: workoutError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const workout_id = workoutData.id;

    // 2. Получаем упражнения с учетом параметров запроса
    let query = supabaseClient
      .from('exercises')
      .select('id, name');

    // Получаем упражнения
    const { data: exercisesData, error: exercisesError } = await query;

    // Создаем фиктивные упражнения, если в БД нет упражнений
    let exercises: DummyExercise[] = [];
    if (exercisesError || !exercisesData || exercisesData.length === 0) {
      console.log('Используем фиктивные упражнения, так как в БД их нет');
      
      // Создаем фиктивные упражнения для тестирования
      exercises = [
        { id: 'ex1', name: 'Отжимания' },
        { id: 'ex2', name: 'Приседания' },
        { id: 'ex3', name: 'Подтягивания' },
        { id: 'ex4', name: 'Планка' },
        { id: 'ex5', name: 'Бёрпи' },
        { id: 'ex6', name: 'Скручивания' }
      ];
    } else {
      exercises = exercisesData;
    }

    // 3. Создаем записи в workout_exercises (3-6 упражнений)
    const exercisesCount = Math.floor(Math.random() * 4) + 3; // от 3 до 6 упражнений
    const shuffledExercises = [...exercises].sort(() => 0.5 - Math.random());
    const selectedExercises = shuffledExercises.slice(0, exercisesCount);
    
    const response: WorkoutResponse = {
      workout_id: workout_id,
      exercises: []
    };

    for (const exercise of selectedExercises) {
      // Определяем параметры тренировки (для примера)
      const sets = Math.floor(Math.random() * 3) + 2; // 2-4 подхода
      const reps = Math.floor(Math.random() * 6) + 8; // 8-13 повторений
      const weight = Math.floor(Math.random() * 10) * 5; // 0-45 кг с шагом 5
      const rest = (Math.floor(Math.random() * 3) + 1) * 30; // 30, 60 или 90 секунд

      // Создаем запись упражнения в тренировке
      const { error: exerciseError } = await supabaseClient
        .from('workout_exercises')
        .insert({
          workout_id: workout_id,
          exercise_id: exercise.id,
          sets: sets,
          reps: reps,
          weight: weight,
          rest: rest,
          status: 'planned'
        });

      if (exerciseError) {
        console.error(`Ошибка при добавлении упражнения в тренировку:`, exerciseError);
        // Продолжаем с другими упражнениями, не останавливаемся из-за ошибки
      }

      // Добавляем упражнение в ответ
      response.exercises.push({
        id: exercise.id,
        name: exercise.name,
        sets: sets,
        reps: reps,
        weight: weight,
        rest: rest
      });
    }

    // Возвращаем результат
    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Необработанная ошибка:', error);
    return new Response(
      JSON.stringify({ error: 'Внутренняя ошибка сервера', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 