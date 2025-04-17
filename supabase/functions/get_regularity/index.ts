import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface RegularityResponse {
  dates: string[];
}

serve(async (req) => {
  try {
    // Получаем параметры запроса
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');

    // Проверяем обязательные параметры
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

    // Формируем запрос к базе данных
    let query = supabaseClient
      .from('workouts')
      .select('date')
      .eq('user_id', user_id)
      .eq('status', 'completed');

    // Добавляем фильтры по датам, если они указаны
    if (start_date) {
      query = query.gte('date', start_date);
    }

    if (end_date) {
      query = query.lte('date', end_date);
    }

    // Выполняем запрос
    const { data, error } = await query;

    if (error) {
      console.error('Ошибка при получении дат тренировок:', error);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении данных', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Преобразуем данные в массив дат
    const dates = data ? data.map(item => item.date) : [];

    // Формируем ответ
    const response: RegularityResponse = {
      dates: dates
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