import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface Stats {
  workouts: number;
  total_time: number;
  progress: number;
  badges: number;
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

    // Подсчитываем количество завершенных тренировок
    const { data: workoutsCount, error: workoutsError } = await supabaseClient
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('status', 'completed');

    if (workoutsError) {
      console.error('Ошибка при получении количества тренировок:', workoutsError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: workoutsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Подсчитываем общее время тренировок
    const { data: timeData, error: timeError } = await supabaseClient.rpc(
      'get_total_workout_time',
      { user_id_param: user_id }
    );

    if (timeError) {
      console.error('Ошибка при получении общего времени тренировок:', timeError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: timeError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Получаем информацию о текущем плане и его прогрессе
    const { data: planData, error: planError } = await supabaseClient
      .from('training_plans')
      .select('progress')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError && planError.code !== 'PGRST116') { // PGRST116 - ошибка "no rows returned"
      console.error('Ошибка при получении прогресса плана:', planError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: planError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Подсчитываем количество достижений
    const { data: badgesCount, error: badgesError } = await supabaseClient
      .from('achievements')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (badgesError) {
      console.error('Ошибка при получении количества бейджей:', badgesError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: badgesError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Формируем ответ
    const stats: Stats = {
      workouts: workoutsCount?.count || 0,
      total_time: timeData?.total_time || 0,
      progress: planData?.progress || 0,
      badges: badgesCount?.count || 0,
    };

    // Возвращаем результат
    return new Response(
      JSON.stringify(stats),
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