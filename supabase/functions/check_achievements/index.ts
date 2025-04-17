import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface Achievement {
  id: string;
  name: string;
  icon: string;
}

interface AchievementsResponse {
  new_achievements: Achievement[];
}

interface WorkoutDateResponse {
  date: string;
}

interface WorkoutDurationResponse {
  total_duration: number;
}

interface ExerciseProgressResponse {
  exercise_id: string;
  initial_weight: number;
  latest_weight: number;
}

interface UserCreateDateResponse {
  created_at: string;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Метод не поддерживается' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Массив для хранения новых достижений
    const newAchievements: Achievement[] = [];

    // Получаем существующие достижения пользователя
    const { data: existingAchievements, error: achievementsError } = await supabaseClient
      .from('achievements')
      .select('name')
      .eq('user_id', userId);

    if (achievementsError) {
      console.error('Ошибка при получении существующих достижений:', achievementsError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении существующих достижений', details: achievementsError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Массив имен существующих достижений
    const existingAchievementNames = existingAchievements?.map(a => a.name) || [];

    // 1. Проверяем "5 тренировок подряд"
    if (!existingAchievementNames.includes('5 тренировок подряд')) {
      // Получаем даты тренировок, отсортированные по возрастанию
      const { data: workoutDates, error: workoutDatesError } = await supabaseClient
        .from('workouts')
        .select('date')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('date', { ascending: true });

      if (!workoutDatesError && workoutDates && workoutDates.length >= 5) {
        // Проверяем последовательность дат (может быть 5 тренировок подряд в любом месте)
        let maxConsecutiveDays = 1;
        let currentConsecutiveDays = 1;

        for (let i = 1; i < workoutDates.length; i++) {
          const currentDate = new Date(workoutDates[i].date);
          const prevDate = new Date(workoutDates[i - 1].date);

          // Разница в днях между датами
          const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Последовательный день
            currentConsecutiveDays++;
            maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
          } else {
            // Прерывание последовательности
            currentConsecutiveDays = 1;
          }

          if (maxConsecutiveDays >= 5) break;
        }

        if (maxConsecutiveDays >= 5) {
          // Добавляем достижение "5 тренировок подряд"
          newAchievements.push({
            id: crypto.randomUUID(),
            name: '5 тренировок подряд',
            icon: '🔥'
          });
        }
      }
    }

    // 2. Проверяем "10 часов тренировок"
    if (!existingAchievementNames.includes('10 часов тренировок')) {
      // Получаем общую длительность тренировок в минутах
      const { data: totalDuration, error: totalDurationError } = await supabaseClient
        .from('workouts')
        .select('sum(duration)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .single();

      if (!totalDurationError && totalDuration && totalDuration.sum >= 600) {  // 600 минут = 10 часов
        // Добавляем достижение "10 часов тренировок"
        newAchievements.push({
          id: crypto.randomUUID(),
          name: '10 часов тренировок',
          icon: '⏱️'
        });
      }
    }

    // 3. Проверяем "+20% к весу"
    if (!existingAchievementNames.includes('+20% к весу')) {
      // Получаем все упражнения пользователя с весами, сгруппированные по exercise_id
      const { data: exerciseProgresses, error: exerciseProgressesError } = await supabaseClient
        .rpc('get_weight_progress', { user_id_param: userId });

      if (!exerciseProgressesError && exerciseProgresses && exerciseProgresses.length > 0) {
        // Проверяем, есть ли хотя бы одно упражнение с прогрессом весов более 20%
        const hasWeightProgress = exerciseProgresses.some(exercise => 
          exercise.initial_weight > 0 && 
          exercise.latest_weight >= exercise.initial_weight * 1.2
        );

        if (hasWeightProgress) {
          // Добавляем достижение "+20% к весу"
          newAchievements.push({
            id: crypto.randomUUID(),
            name: '+20% к весу',
            icon: '💪'
          });
        }
      }
    }

    // 4. Проверяем "1 месяц с нами"
    if (!existingAchievementNames.includes('1 месяц с нами')) {
      // Получаем дату создания аккаунта пользователя
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (!userError && userData && userData.created_at) {
        const createdAt = new Date(userData.created_at);
        const now = new Date();
        const diffDays = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 30) {  // 30 дней = 1 месяц
          // Добавляем достижение "1 месяц с нами"
          newAchievements.push({
            id: crypto.randomUUID(),
            name: '1 месяц с нами',
            icon: '🏆'
          });
        }
      }
    }

    // Добавляем новые достижения в БД
    if (newAchievements.length > 0) {
      const achievementsToInsert = newAchievements.map(achievement => ({
        id: achievement.id,
        user_id: userId,
        name: achievement.name,
        icon: achievement.icon,
        date_earned: new Date().toISOString()
      }));

      const { error: insertError } = await supabaseClient
        .from('achievements')
        .insert(achievementsToInsert);

      if (insertError) {
        console.error('Ошибка при сохранении новых достижений:', insertError);
        return new Response(
          JSON.stringify({ error: 'Ошибка при сохранении новых достижений', details: insertError }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Формируем ответ
    const response: AchievementsResponse = {
      new_achievements: newAchievements
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