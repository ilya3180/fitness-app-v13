import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Интерфейсы для типизации
interface WorkoutExerciseUpdate {
  id: string;
  actual_sets?: number;
  actual_reps?: number;
  actual_weight?: number;
  status: string;
}

interface WorkoutUpdate {
  status?: string;
  feedback?: string;
  exercises: WorkoutExerciseUpdate[];
}

serve(async (req) => {
  try {
    // Проверяем метод запроса
    if (req.method !== 'PATCH' && req.method !== 'PUT') {
      return new Response(
        JSON.stringify({ error: 'Метод не поддерживается' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Получаем ID тренировки из URL
    const url = new URL(req.url);
    const paths = url.pathname.split('/');
    const workout_id = paths[paths.length - 1]; // Последний сегмент URL

    if (!workout_id) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать ID тренировки в URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Получаем параметры запроса из тела
    const updateData: WorkoutUpdate = await req.json();
    
    if (!updateData.exercises || !Array.isArray(updateData.exercises)) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать массив exercises' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем Supabase клиент с ролью сервиса
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Обновляем основную информацию о тренировке
    if (updateData.status || updateData.feedback) {
      const updateFields: Record<string, any> = {};
      
      if (updateData.status) {
        updateFields.status = updateData.status;
      }
      
      if (updateData.feedback) {
        updateFields.feedback = updateData.feedback;
      }
      
      const { error: updateWorkoutError } = await supabaseClient
        .from('workouts')
        .update(updateFields)
        .eq('id', workout_id);

      if (updateWorkoutError) {
        console.error('Ошибка при обновлении тренировки:', updateWorkoutError);
        return new Response(
          JSON.stringify({ error: 'Ошибка при обновлении тренировки', details: updateWorkoutError }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Обновляем информацию о выполненных упражнениях
    let updateErrors = [];
    for (const exercise of updateData.exercises) {
      if (!exercise.id) {
        updateErrors.push('Отсутствует ID упражнения');
        continue;
      }

      const updateFields: Record<string, any> = {
        status: exercise.status // Статус обязателен
      };
      
      // Добавляем опциональные поля, если они указаны
      if (exercise.actual_sets !== undefined) {
        updateFields.actual_sets = exercise.actual_sets;
      }
      
      if (exercise.actual_reps !== undefined) {
        updateFields.actual_reps = exercise.actual_reps;
      }
      
      if (exercise.actual_weight !== undefined) {
        updateFields.actual_weight = exercise.actual_weight;
      }
      
      const { error: updateExerciseError } = await supabaseClient
        .from('workout_exercises')
        .update(updateFields)
        .eq('id', exercise.id)
        .eq('workout_id', workout_id); // Дополнительная проверка, что упражнение принадлежит тренировке

      if (updateExerciseError) {
        console.error(`Ошибка при обновлении упражнения ${exercise.id}:`, updateExerciseError);
        updateErrors.push(`Ошибка при обновлении упражнения ${exercise.id}: ${updateExerciseError.message}`);
      }
    }

    // 3. Проверяем, завершены ли все упражнения, и если да, обновляем статус тренировки
    if (updateData.status === 'completed' || (updateData.exercises.every(e => e.status === 'completed'))) {
      // Получаем все упражнения в тренировке
      const { data: allExercises, error: exercisesError } = await supabaseClient
        .from('workout_exercises')
        .select('status')
        .eq('workout_id', workout_id);

      if (!exercisesError && allExercises && allExercises.every(e => e.status === 'completed')) {
        // Все упражнения завершены, обновляем статус тренировки
        await supabaseClient
          .from('workouts')
          .update({ status: 'completed' })
          .eq('id', workout_id);
      }
    }

    // Формируем ответ
    const response = {
      success: updateErrors.length === 0,
      errors: updateErrors.length > 0 ? updateErrors : undefined
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