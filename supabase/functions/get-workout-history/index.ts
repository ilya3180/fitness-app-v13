import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface HistoryResponse {
  workouts: {
    id: string;
    type: string;
    date: string;
    duration: number;
    calories: number | null;
    status: string;
  }[];
}

serve(async (req) => {
  try {
    // Получаем параметры запроса
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') || '10') : 10;

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

    // Получаем историю тренировок пользователя
    const { data: workouts, error: workoutsError } = await supabaseClient
      .from('workouts')
      .select('id, type, date, duration, calories, status')
      .eq('user_id', user_id)
      .order('date', { ascending: false }) // Сначала новые тренировки
      .limit(limit);

    if (workoutsError) {
      console.error('Ошибка при получении истории тренировок:', workoutsError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: workoutsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Формируем ответ
    const response: HistoryResponse = {
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