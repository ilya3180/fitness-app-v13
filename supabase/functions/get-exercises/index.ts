import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface Exercise {
  id: string;
  name: string;
  description: string;
  tips: string;
  image_url: string;
  muscles: string[];
}

interface ExercisesResponse {
  exercises: Exercise[];
}

// Функция для создания демо-упражнений, если в БД их нет
function createDemoExercises(): Exercise[] {
  return [
    {
      id: "ex1",
      name: "Отжимания",
      description: "Классическое упражнение для развития мышц груди, плеч и трицепсов",
      tips: "Держите локти близко к телу для акцента на трицепсы, шире для груди",
      image_url: "https://example.com/images/pushups.jpg",
      muscles: ["Грудные", "Трицепс", "Плечи"]
    },
    {
      id: "ex2",
      name: "Приседания",
      description: "Базовое упражнение для развития силы ног",
      tips: "Следите, чтобы колени не выходили за носки",
      image_url: "https://example.com/images/squats.jpg",
      muscles: ["Квадрицепсы", "Ягодицы", "Икры"]
    },
    {
      id: "ex3",
      name: "Подтягивания",
      description: "Эффективное упражнение для мышц спины и бицепсов",
      tips: "Начинайте с широкого хвата для акцента на спину",
      image_url: "https://example.com/images/pullups.jpg",
      muscles: ["Спина", "Бицепс", "Предплечья"]
    },
    {
      id: "ex4",
      name: "Планка",
      description: "Статическое упражнение для укрепления кора",
      tips: "Держите тело прямым, не прогибайтесь в пояснице",
      image_url: "https://example.com/images/plank.jpg",
      muscles: ["Пресс", "Спина", "Плечи"]
    },
    {
      id: "ex5",
      name: "Бёрпи",
      description: "Комплексное упражнение для всего тела и кардио",
      tips: "Для облегчения можно исключить отжимание или прыжок",
      image_url: "https://example.com/images/burpee.jpg",
      muscles: ["Ноги", "Грудные", "Кор", "Плечи"]
    },
    {
      id: "ex6",
      name: "Скручивания",
      description: "Упражнение для мышц пресса",
      tips: "Сконцентрируйтесь на сокращении мышц пресса, а не на движении",
      image_url: "https://example.com/images/crunches.jpg",
      muscles: ["Пресс"]
    }
  ];
}

serve(async (req) => {
  try {
    // Получаем параметры запроса
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const inventory = url.searchParams.get('inventory');
    const musclesParam = url.searchParams.get('muscles');
    
    let muscles: string[] = [];
    if (musclesParam) {
      try {
        muscles = JSON.parse(musclesParam);
      } catch (e) {
        // Если не удалось распарсить JSON, предполагаем, что это строка с разделителем в виде запятой
        muscles = musclesParam.split(',').map(m => m.trim());
      }
    }

    // Создаем Supabase клиент с ролью сервиса
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Проверяем наличие упражнений в БД
    const { data: exercisesCheck, error: exercisesCheckError } = await supabaseClient
      .from('exercises')
      .select('id')
      .limit(1);

    if (exercisesCheckError || !exercisesCheck || exercisesCheck.length === 0) {
      console.log('Используем демо-упражнения, так как в БД их нет');
      
      // Возвращаем демо-упражнения
      const demoExercises = createDemoExercises();
      
      // Применяем фильтры к демо-упражнениям
      let filteredExercises = [...demoExercises];
      
      // Фильтр по типу
      if (type) {
        // Для демо упрощенно считаем все упражнения 'bodyweight'
        if (type !== 'bodyweight') {
          filteredExercises = [];
        }
      }
      
      // Фильтр по инвентарю
      if (inventory) {
        // Для демо все упражнения не требуют инвентаря
        if (inventory !== 'none' && inventory !== 'bodyweight') {
          filteredExercises = [];
        }
      }
      
      // Фильтр по целевым мышцам
      if (muscles && muscles.length > 0) {
        filteredExercises = filteredExercises.filter(exercise => 
          exercise.muscles.some(muscle => muscles.includes(muscle))
        );
      }
      
      const response: ExercisesResponse = {
        exercises: filteredExercises
      };
      
      return new Response(
        JSON.stringify(response),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Формируем запрос к БД для получения упражнений
    let query = supabaseClient
      .from('exercises')
      .select(`
        id, 
        name, 
        description, 
        tips, 
        image_url,
        type,
        inventory
      `);

    // Применяем фильтры, если они указаны
    if (type) {
      query = query.eq('type', type);
    }

    if (inventory) {
      // Предполагаем, что inventory хранится как jsonb массив
      query = query.contains('inventory', [inventory]);
    }

    // Получаем упражнения
    const { data: exercisesData, error: exercisesError } = await query;

    if (exercisesError) {
      console.error('Ошибка при получении упражнений:', exercisesError);
      return new Response(
        JSON.stringify({ error: 'Ошибка при получении упражнений', details: exercisesError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Если нет упражнений, возвращаем пустой список
    if (!exercisesData || exercisesData.length === 0) {
      return new Response(
        JSON.stringify({ exercises: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    let filteredExercises = exercisesData;

    // Если указаны целевые мышцы, делаем дополнительный запрос для фильтрации
    if (muscles && muscles.length > 0) {
      try {
        // Получаем идентификаторы мышц
        const { data: muscleGroupsData, error: muscleGroupsError } = await supabaseClient
          .from('muscle_groups')
          .select('id, name')
          .in('name', muscles);
        
        if (muscleGroupsError || !muscleGroupsData || muscleGroupsData.length === 0) {
          console.error('Ошибка при получении мышечных групп или их нет:', muscleGroupsError);
        } else {
          const muscleIds = muscleGroupsData.map(mg => mg.id);
          
          // Получаем связи упражнений с мышцами
          const { data: exerciseMuscleData, error: exerciseMuscleError } = await supabaseClient
            .from('exercise_muscle')
            .select('exercise_id, muscle_group_id')
            .in('muscle_group_id', muscleIds);
          
          if (exerciseMuscleError || !exerciseMuscleData) {
            console.error('Ошибка при получении связей упражнений с мышцами:', exerciseMuscleError);
          } else {
            // Фильтруем упражнения по мышцам
            const exerciseIdsWithTargetMuscles = [...new Set(exerciseMuscleData.map(em => em.exercise_id))];
            filteredExercises = exercisesData.filter(ex => exerciseIdsWithTargetMuscles.includes(ex.id));
          }
        }
      } catch (e) {
        console.error('Ошибка при фильтрации по мышцам:', e);
      }
    }

    // Для каждого упражнения получаем целевые мышцы
    const exercisesWithMuscles: Exercise[] = await Promise.all(
      filteredExercises.map(async (exercise) => {
        let muscles: string[] = [];
        
        try {
          // Получаем связи упражнения с мышцами
          const { data: exerciseMuscleData, error: exerciseMuscleError } = await supabaseClient
            .from('exercise_muscle')
            .select('muscle_group_id')
            .eq('exercise_id', exercise.id);
          
          if (!exerciseMuscleError && exerciseMuscleData && exerciseMuscleData.length > 0) {
            const muscleIds = exerciseMuscleData.map(em => em.muscle_group_id);
            
            // Получаем названия мышц
            const { data: muscleGroupsData, error: muscleGroupsError } = await supabaseClient
              .from('muscle_groups')
              .select('name')
              .in('id', muscleIds);
            
            if (!muscleGroupsError && muscleGroupsData) {
              muscles = muscleGroupsData.map(mg => mg.name);
            }
          }
        } catch (e) {
          console.error(`Ошибка при получении мышц для упражнения ${exercise.id}:`, e);
        }
        
        return {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description || '',
          tips: exercise.tips || '',
          image_url: exercise.image_url || '',
          muscles: muscles
        };
      })
    );

    // Формируем ответ
    const response: ExercisesResponse = {
      exercises: exercisesWithMuscles
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