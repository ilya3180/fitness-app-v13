import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Интерфейсы для типизации
interface PlanRequest {
  user_id: string;
  goal: string;
  level: string;
  frequency: number;
  duration: number; // в неделях
  inventory: string[]; 
  target_muscles: string[];
}

interface PlanResponse {
  plan_id: string;
  workouts: {
    id: string;
    date: string;
  }[];
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
    const requestData: PlanRequest = await req.json();
    
    // Проверяем наличие обязательных полей
    if (!requestData.user_id) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать user_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!requestData.goal || !requestData.level || !requestData.frequency || !requestData.duration) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать goal, level, frequency и duration' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем Supabase клиент с ролью сервиса
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Сохраняем план в training_plans
    const { data: planData, error: planError } = await supabaseClient
      .from('training_plans')
      .insert({
        user_id: requestData.user_id,
        name: `План ${requestData.goal} (${requestData.level})`,
        goal: requestData.goal,
        level: requestData.level,
        frequency: requestData.frequency,
        duration: requestData.duration,
        progress: 0
      })
      .select('id')
      .single();

    if (planError) {
      console.error('Ошибка при создании плана:', planError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при создании плана', details: planError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const plan_id = planData.id;

    // 2. Получаем упражнения (без фильтрации по мышцам для упрощения)
    const { data: exercisesData, error: exercisesError } = await supabaseClient
      .from('exercises')
      .select('id, name, type')
      .limit(50);

    if (exercisesError) {
      console.error('Ошибка при получении упражнений:', exercisesError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении упражнений', details: exercisesError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!exercisesData || exercisesData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Не найдены упражнения для создания плана' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Создаем записи в workouts для каждой тренировки
    const workouts: { id: string; date: string }[] = [];
    const totalWorkouts = requestData.frequency * requestData.duration;
    const today = new Date();
    
    for (let i = 0; i < totalWorkouts; i++) {
      // Рассчитываем дату тренировки
      const workoutDate = new Date(today);
      workoutDate.setDate(today.getDate() + Math.floor(i / requestData.frequency) * 7 + (i % requestData.frequency) * 2);
      
      // Определяем тип тренировки (чередуем)
      const workoutType = i % 3 === 0 ? 'strength' : (i % 3 === 1 ? 'cardio' : 'flexibility');
      
      // Создаем запись тренировки
      const { data: workoutData, error: workoutError } = await supabaseClient
        .from('workouts')
        .insert({
          user_id: requestData.user_id,
          plan_id: plan_id,
          type: workoutType,
          date: workoutDate.toISOString().split('T')[0],
          duration: 45, // По умолчанию 45 минут
          status: 'planned'
        })
        .select('id')
        .single();

      if (workoutError) {
        console.error(`Ошибка при создании тренировки ${i + 1}:`, workoutError);
        continue; // Пропускаем ошибочную тренировку и продолжаем
      }

      workouts.push({
        id: workoutData.id,
        date: workoutDate.toISOString().split('T')[0]
      });

      // 4. Создаем записи в workout_exercises для тренировки (3-6 упражнений)
      // Выбираем случайные упражнения для тренировки
      const exercisesCount = Math.floor(Math.random() * 4) + 3; // от 3 до 6 упражнений
      const shuffledExercises = [...exercisesData].sort(() => 0.5 - Math.random());
      const selectedExercises = shuffledExercises.slice(0, exercisesCount);
      
      for (const exercise of selectedExercises) {
        // Определяем параметры тренировки в зависимости от уровня
        let sets = 3;
        let reps = 10;
        let rest = 60;
        
        if (requestData.level === 'beginner') {
          sets = 2;
          reps = 8;
          rest = 90;
        } else if (requestData.level === 'advanced') {
          sets = 4;
          reps = 12;
          rest = 45;
        }

        // Создаем запись упражнения в тренировке
        const { error: exerciseError } = await supabaseClient
          .from('workout_exercises')
          .insert({
            workout_id: workoutData.id,
            exercise_id: exercise.id,
            sets: sets,
            reps: reps,
            weight: 0, // Начальный вес будет установлен пользователем
            rest: rest,
            status: 'planned'
          });

        if (exerciseError) {
          console.error(`Ошибка при добавлении упражнения в тренировку:`, exerciseError);
          // Продолжаем с другими упражнениями, не останавливаемся из-за ошибки
        }
      }
    }

    // Формируем ответ
    const response: PlanResponse = {
      plan_id: plan_id,
      workouts: workouts
    };

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