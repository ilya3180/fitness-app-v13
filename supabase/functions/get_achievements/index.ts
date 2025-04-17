import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface Achievement {
  id: string;
  name: string;
  icon: string;
  date_earned: string;
}

interface AchievementsResponse {
  achievements: Achievement[];
}

serve(async (req) => {
  try {
    // Получаем user_id из параметров запроса
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id обязателен' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем Supabase клиент
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Получаем достижения пользователя
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from('achievements')
      .select('id, name, icon, date_earned')
      .eq('user_id', userId)
      .order('date_earned', { ascending: false });

    if (achievementsError) {
      console.error('Ошибка при получении достижений:', achievementsError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении достижений', details: achievementsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Формируем ответ
    const response: AchievementsResponse = {
      achievements: achievements || []
    };

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