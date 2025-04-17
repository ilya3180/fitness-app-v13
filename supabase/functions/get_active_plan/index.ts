import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface PlanResponse {
  id: string;
  name: string;
  progress: number;
  workouts: {
    id: string;
    date: string;
    status: string;
  }[];
}

serve(async (req) => {
  try {
    // Получаем параметры запроса
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');

    // Проверяем наличие user_id
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Необходимо указать user_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем Supabase клиент с ролью сервиса
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Находим последний активный план
    const { data: plan, error: planError } = await supabaseClient
      .from('training_plans')
      .select('id, name, progress')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError) {
      // Если ошибка связана с отсутствием плана, возвращаем пустой ответ
      if (planError.code === 'PGRST116') { // PGRST116 - ошибка "no rows returned"
        return new Response(
          JSON.stringify({ error: 'Активный план не найден' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('Ошибка при получении плана:', planError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: planError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Получаем список тренировок для этого плана
    const { data: workouts, error: workoutsError } = await supabaseClient
      .from('workouts')
      .select('id, date, status')
      .eq('plan_id', plan.id)
      .order('date', { ascending: true });

    if (workoutsError) {
      console.error('Ошибка при получении тренировок:', workoutsError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: workoutsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Пересчитываем прогресс (количество завершенных тренировок / общее количество тренировок * 100)
    let progress = 0;
    if (workouts && workouts.length > 0) {
      const completedWorkouts = workouts.filter(workout => workout.status === 'completed').length;
      progress = (completedWorkouts / workouts.length) * 100;
      
      // Обновляем прогресс в БД, если он отличается от текущего
      if (progress !== plan.progress) {
        await supabaseClient
          .from('training_plans')
          .update({ progress })
          .eq('id', plan.id);
      }
    }

    // Формируем ответ
    const response: PlanResponse = {
      id: plan.id,
      name: plan.name,
      progress: progress,
      workouts: workouts || []
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