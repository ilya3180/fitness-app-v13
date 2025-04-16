-- 1. Заполнение таблицы muscle_groups (группы мышц)
INSERT INTO muscle_groups (name) VALUES
('Грудные мышцы'),
('Трицепс'),
('Бицепс'),
('Плечи'),
('Широчайшие'),
('Спина'),
('Пресс'),
('Квадрицепсы'),
('Ягодичные мышцы'),
('Задняя поверхность бедра'),
('Голень'),
('Предплечья'),
('Шея'),
('Трапеции'),
('Кор')
ON CONFLICT (name) DO NOTHING;

-- 2. Заполнение таблицы exercises (упражнения)
-- Упражнения для дома без инвентаря
INSERT INTO exercises (name, type, inventory, description, tips, image_url) VALUES
-- Кардио
('Бег на месте', 'Кардио', '{}', 'Простое кардио-упражнение для повышения частоты сердечных сокращений.', 'Старайтесь поднимать колени высоко. Сохраняйте равномерное дыхание.', 'https://example.com/jogging.jpg'),
('Прыжки со скакалкой', 'Кардио', '{"скакалка": true}', 'Интенсивное кардио-упражнение для всего тела.', 'Держите локти близко к телу. Прыгайте на подушечках стоп.', 'https://example.com/jump_rope.jpg'),
('Берпи', 'Кардио', '{}', 'Комплексное кардио-упражнение, включающее приседание, планку и прыжок.', 'Сохраняйте прямую линию тела в планке. Взрывно выпрыгивайте вверх.', 'https://example.com/burpee.jpg'),
('Скалолаз', 'Кардио', '{}', 'Динамичное упражнение для кардио и кора.', 'Держите бедра низко. Сохраняйте напряжение в корпусе.', 'https://example.com/mountain_climber.jpg'),
('Прыжки из приседа', 'Кардио', '{}', 'Взрывное кардио-упражнение для нижней части тела.', 'Приземляйтесь мягко, сгибая колени. Используйте руки для импульса.', 'https://example.com/squat_jumps.jpg'),

-- Грудные мышцы
('Отжимания от пола', 'Силовое', '{}', 'Базовое упражнение для развития грудных мышц и трицепса.', 'Держите тело прямым. Опускайтесь, пока грудь не окажется близко к полу.', 'https://example.com/pushups.jpg'),
('Отжимания с широкой постановкой рук', 'Силовое', '{}', 'Вариация отжиманий с акцентом на грудные мышцы.', 'Руки расположите шире плеч. Следите за положением локтей.', 'https://example.com/wide_pushups.jpg'),
('Отжимания с узкой постановкой рук', 'Силовое', '{}', 'Вариация отжиманий с акцентом на трицепс.', 'Руки расположите уже плеч. Локти держите близко к корпусу.', 'https://example.com/narrow_pushups.jpg'),
('Отжимания с возвышением для ног', 'Силовое', '{}', 'Усложненный вариант отжиманий для верхней части груди.', 'Поставьте ноги на стул или скамью. Сохраняйте прямую линию тела.', 'https://example.com/decline_pushups.jpg'),
('Отжимания от скамьи', 'Силовое', '{"скамья": true}', 'Облегченная версия отжиманий для начинающих.', 'Ладони расположите на краю скамьи. Опускайте тело до уровня скамьи.', 'https://example.com/bench_pushups.jpg'),

-- Спина
('Подтягивания широким хватом', 'Силовое', '{"турник": true}', 'Базовое упражнение для развития спины.', 'Тяните локти вниз. Старайтесь дотянуться грудью до перекладины.', 'https://example.com/pullups.jpg'),
('Подтягивания узким хватом', 'Силовое', '{"турник": true}', 'Вариация подтягиваний с акцентом на бицепс.', 'Держите локти близко к телу. Поднимайтесь до подбородка.', 'https://example.com/chinups.jpg'),
('Гиперэкстензия', 'Силовое', '{}', 'Упражнение для укрепления нижней части спины.', 'Лягте на живот, руки за головой. Поднимайте верхнюю часть тела.', 'https://example.com/hyperextension.jpg'),
('Обратные отжимания от скамьи', 'Силовое', '{"скамья": true}', 'Упражнение для укрепления трицепса и задних дельт.', 'Руки поставьте на скамью за спиной. Опускайте тело, сгибая локти.', 'https://example.com/reverse_bench_dips.jpg'),
('Тяга гантели в наклоне', 'Силовое', '{"гантели": true}', 'Базовое упражнение для развития средней части спины.', 'Наклонитесь вперед, спина прямая. Тяните гантель к поясу.', 'https://example.com/dumbbell_row.jpg'),

-- Ноги
('Приседания с собственным весом', 'Силовое', '{}', 'Базовое упражнение для развития мышц ног.', 'Держите спину прямой. Колени не должны выходить за носки.', 'https://example.com/bodyweight_squats.jpg'),
('Выпады вперед', 'Силовое', '{}', 'Упражнение для развития квадрицепсов и ягодичных мышц.', 'Делайте широкий шаг вперед. Колено задней ноги почти касается пола.', 'https://example.com/forward_lunges.jpg'),
('Болгарские сплит-приседания', 'Силовое', '{"скамья": true}', 'Упражнение для развития силы одной ноги.', 'Заднюю ногу поставьте на скамью. Опускайтесь до параллели бедра с полом.', 'https://example.com/bulgarian_split_squats.jpg'),
('Подъемы на носки', 'Силовое', '{}', 'Упражнение для развития мышц голени.', 'Встаньте на край ступеньки. Опускайте пятки ниже уровня ступеньки.', 'https://example.com/calf_raises.jpg'),
('Мостик на одной ноге', 'Силовое', '{}', 'Упражнение для развития ягодичных мышц.', 'Лягте на спину, одну ногу согните. Вторую вытяните вверх. Поднимайте бедра.', 'https://example.com/single_leg_bridge.jpg'),

-- Плечи
('Отжимания в стойке на руках', 'Силовое', '{}', 'Продвинутое упражнение для плеч и кора.', 'Встаньте в стойку у стены. Опускайтесь, сгибая руки.', 'https://example.com/handstand_pushups.jpg'),
('Подъемы рук через стороны', 'Силовое', '{"гантели": true}', 'Изолированное упражнение для средних дельт.', 'Держите руки слегка согнутыми. Поднимайте до уровня плеч.', 'https://example.com/lateral_raises.jpg'),
('Y-подъемы', 'Силовое', '{}', 'Упражнение для задних дельт и верхней части спины.', 'Лягте на живот. Поднимайте руки вверх в форме буквы Y.', 'https://example.com/y_raises.jpg'),
('Передние подъемы', 'Силовое', '{"гантели": true}', 'Изолированное упражнение для передних дельт.', 'Поднимайте руки перед собой до уровня плеч. Контролируйте движение.', 'https://example.com/front_raises.jpg'),
('Обратные мухи', 'Силовое', '{"гантели": true}', 'Упражнение для задних дельт.', 'Наклонитесь вперед. Разводите руки в стороны.', 'https://example.com/reverse_flyes.jpg'),

-- Бицепс
('Сгибания рук с гантелями', 'Силовое', '{"гантели": true}', 'Базовое упражнение для бицепса.', 'Держите локти прижатыми к бокам. Полностью разгибайте и сгибайте руки.', 'https://example.com/bicep_curls.jpg'),
('Молотковые сгибания', 'Силовое', '{"гантели": true}', 'Вариация сгибаний рук для брахиалиса.', 'Держите гантели как молотки. Сгибайте руки, не поворачивая кисти.', 'https://example.com/hammer_curls.jpg'),
('Концентрированные сгибания', 'Силовое', '{"гантели": true}', 'Изолированное упражнение для пикового сокращения бицепса.', 'Сядьте, упритесь локтем во внутреннюю часть бедра. Медленно сгибайте руку.', 'https://example.com/concentration_curls.jpg'),
('Подтягивания обратным хватом', 'Силовое', '{"турник": true}', 'Сложное упражнение для бицепса.', 'Возьмитесь за турник ладонями к себе. Подтягивайтесь, сгибая руки.', 'https://example.com/chinups_underhand.jpg'),
('Сгибания рук с сопротивлением', 'Силовое', '{"резинка": true}', 'Упражнение для бицепса с использованием резинки.', 'Встаньте на резинку, возьмитесь за другой конец. Сгибайте руки.', 'https://example.com/resistance_band_curls.jpg'),

-- Трицепс
('Отжимания на трицепс', 'Силовое', '{}', 'Упражнение для трицепса с узкой постановкой рук.', 'Поставьте руки близко друг к другу. Локти направлены назад.', 'https://example.com/tricep_pushups.jpg'),
('Французский жим с гантелей', 'Силовое', '{"гантели": true}', 'Изолированное упражнение для трицепса.', 'Лягте на спину. Опускайте гантель за голову, разгибайте руки.', 'https://example.com/french_press.jpg'),
('Разгибания рук с сопротивлением', 'Силовое', '{"резинка": true}', 'Упражнение для трицепса с использованием резинки.', 'Закрепите резинку вверху. Разгибайте руки, опуская их вниз.', 'https://example.com/resistance_band_pushdowns.jpg'),
('Отжимания алмазом', 'Силовое', '{}', 'Интенсивное упражнение для трицепса.', 'Сложите руки в форме алмаза. Опускайтесь, держа локти близко к телу.', 'https://example.com/diamond_pushups.jpg'),
('Разгибания руки назад', 'Силовое', '{"гантели": true}', 'Изолированное упражнение для трицепса.', 'Наклонитесь вперед. Разгибайте руку с гантелей назад.', 'https://example.com/tricep_kickbacks.jpg'),

-- Пресс
('Скручивания', 'Силовое', '{}', 'Базовое упражнение для пресса.', 'Лягте на спину, ноги согнуты. Поднимайте верхнюю часть тела.', 'https://example.com/crunches.jpg'),
('Планка', 'Силовое', '{}', 'Статическое упражнение для кора.', 'Удерживайте тело в прямой линии. Напрягайте мышцы кора.', 'https://example.com/plank.jpg'),
('Русские скручивания', 'Силовое', '{}', 'Упражнение для косых мышц живота.', 'Сядьте, слегка откиньтесь назад. Поворачивайте корпус из стороны в сторону.', 'https://example.com/russian_twists.jpg'),
('Подъемы ног в висе', 'Силовое', '{"турник": true}', 'Сложное упражнение для нижней части пресса.', 'Висите на турнике. Поднимайте ноги до угла 90 градусов или выше.', 'https://example.com/hanging_leg_raises.jpg'),
('Велосипед', 'Силовое', '{}', 'Динамичное упражнение для всего пресса.', 'Лягте на спину. Имитируйте вращение педалей, касаясь локтем противоположного колена.', 'https://example.com/bicycle_crunches.jpg');

-- 3. Заполнение таблицы exercise_muscle (связь упражнений с группами мышц)
-- Для кардио-упражнений
WITH exercise_names AS (
  SELECT id, name FROM exercises WHERE name IN ('Бег на месте', 'Прыжки со скакалкой', 'Берпи', 'Скалолаз', 'Прыжки из приседа')
), muscle_group_names AS (
  SELECT id, name FROM muscle_groups WHERE name IN ('Квадрицепсы', 'Ягодичные мышцы', 'Кор')
)
INSERT INTO exercise_muscle (exercise_id, muscle_group_id)
SELECT e.id, m.id
FROM exercise_names e, muscle_group_names m
WHERE (e.name = 'Бег на месте' AND m.name IN ('Квадрицепсы', 'Ягодичные мышцы')) OR
      (e.name = 'Прыжки со скакалкой' AND m.name IN ('Квадрицепсы', 'Голень')) OR
      (e.name = 'Берпи' AND m.name IN ('Грудные мышцы', 'Квадрицепсы', 'Кор')) OR
      (e.name = 'Скалолаз' AND m.name IN ('Кор', 'Плечи')) OR
      (e.name = 'Прыжки из приседа' AND m.name IN ('Квадрицепсы', 'Ягодичные мышцы'));

-- Для упражнений на грудные мышцы
WITH exercise_names AS (
  SELECT id, name FROM exercises WHERE name IN ('Отжимания от пола', 'Отжимания с широкой постановкой рук', 'Отжимания с узкой постановкой рук', 'Отжимания с возвышением для ног', 'Отжимания от скамьи')
), muscle_group_names AS (
  SELECT id, name FROM muscle_groups WHERE name IN ('Грудные мышцы', 'Трицепс', 'Плечи')
)
INSERT INTO exercise_muscle (exercise_id, muscle_group_id)
SELECT e.id, m.id
FROM exercise_names e, muscle_group_names m
WHERE (e.name = 'Отжимания от пола' AND m.name IN ('Грудные мышцы', 'Трицепс', 'Плечи')) OR
      (e.name = 'Отжимания с широкой постановкой рук' AND m.name IN ('Грудные мышцы', 'Плечи')) OR
      (e.name = 'Отжимания с узкой постановкой рук' AND m.name IN ('Трицепс', 'Грудные мышцы')) OR
      (e.name = 'Отжимания с возвышением для ног' AND m.name IN ('Грудные мышцы', 'Плечи')) OR
      (e.name = 'Отжимания от скамьи' AND m.name IN ('Грудные мышцы', 'Трицепс'));

-- Для упражнений на спину
WITH exercise_names AS (
  SELECT id, name FROM exercises WHERE name IN ('Подтягивания широким хватом', 'Подтягивания узким хватом', 'Гиперэкстензия', 'Обратные отжимания от скамьи', 'Тяга гантели в наклоне')
), muscle_group_names AS (
  SELECT id, name FROM muscle_groups WHERE name IN ('Широчайшие', 'Бицепс', 'Спина', 'Трицепс', 'Трапеции')
)
INSERT INTO exercise_muscle (exercise_id, muscle_group_id)
SELECT e.id, m.id
FROM exercise_names e, muscle_group_names m
WHERE (e.name = 'Подтягивания широким хватом' AND m.name IN ('Широчайшие', 'Спина')) OR
      (e.name = 'Подтягивания узким хватом' AND m.name IN ('Широчайшие', 'Бицепс')) OR
      (e.name = 'Гиперэкстензия' AND m.name IN ('Спина')) OR
      (e.name = 'Обратные отжимания от скамьи' AND m.name IN ('Трицепс', 'Плечи')) OR
      (e.name = 'Тяга гантели в наклоне' AND m.name IN ('Широчайшие', 'Трапеции'));

-- Продолжаем для остальных групп упражнений (ноги, плечи, бицепс, трицепс, пресс)
-- Для упражнений на ноги
WITH exercise_names AS (
  SELECT id, name FROM exercises WHERE name IN ('Приседания с собственным весом', 'Выпады вперед', 'Болгарские сплит-приседания', 'Подъемы на носки', 'Мостик на одной ноге')
), muscle_group_names AS (
  SELECT id, name FROM muscle_groups WHERE name IN ('Квадрицепсы', 'Ягодичные мышцы', 'Задняя поверхность бедра', 'Голень')
)
INSERT INTO exercise_muscle (exercise_id, muscle_group_id)
SELECT e.id, m.id
FROM exercise_names e, muscle_group_names m
WHERE (e.name = 'Приседания с собственным весом' AND m.name IN ('Квадрицепсы', 'Ягодичные мышцы')) OR
      (e.name = 'Выпады вперед' AND m.name IN ('Квадрицепсы', 'Ягодичные мышцы')) OR
      (e.name = 'Болгарские сплит-приседания' AND m.name IN ('Квадрицепсы', 'Ягодичные мышцы')) OR
      (e.name = 'Подъемы на носки' AND m.name IN ('Голень')) OR
      (e.name = 'Мостик на одной ноге' AND m.name IN ('Ягодичные мышцы', 'Задняя поверхность бедра'));

-- 4. Создание тестовых данных для achievements (достижения)
-- Обратите внимание: Эти достижения не привязаны к пользователю, они будут использоваться как шаблоны
-- Добавьте правильный user_id при регистрации реального пользователя
-- Для тестирования, вы можете выполнить:
-- UPDATE achievements SET user_id = '56728de7-8261-4d23-aaef-e8964733cbaf' 
-- Заменив ID на реальный ID пользователя из таблицы auth.users

-- Удалим предыдущую попытку добавления достижений
DELETE FROM achievements;

-- Создадим таблицу achievement_templates для хранения шаблонов достижений
CREATE TABLE IF NOT EXISTS achievement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT
);

-- Заполним шаблоны достижений
INSERT INTO achievement_templates (name, icon, description) VALUES
('5 тренировок подряд', 'streak_5', 'Выполните 5 тренировок подряд, не пропуская ни дня'),
('10 тренировок подряд', 'streak_10', 'Выполните 10 тренировок подряд, не пропуская ни дня'),
('10 часов тренировок', 'time_10h', 'Проведите в общей сложности 10 часов за тренировками'),
('20 часов тренировок', 'time_20h', 'Проведите в общей сложности 20 часов за тренировками'),
('+10% к весу', 'weight_10', 'Увеличьте рабочий вес на 10% в любом упражнении'),
('+20% к весу', 'weight_20', 'Увеличьте рабочий вес на 20% в любом упражнении'),
('1 месяц с нами', 'month_1', 'Используйте приложение в течение месяца'),
('3 месяца с нами', 'month_3', 'Используйте приложение в течение трех месяцев'),
('5 завершенных тренировок', 'workouts_5', 'Завершите 5 тренировок'),
('10 завершенных тренировок', 'workouts_10', 'Завершите 10 тренировок'),
('20 завершенных тренировок', 'workouts_20', 'Завершите 20 тренировок'),
('Первая силовая тренировка', 'first_strength', 'Выполните первую силовую тренировку'),
('Первая кардио тренировка', 'first_cardio', 'Выполните первую кардио тренировку'),
('Тренировка всего тела', 'full_body', 'Выполните тренировку на все группы мышц'),
('Тренировка высокой интенсивности', 'high_intensity', 'Выполните высокоинтенсивную тренировку');

-- Функция для автоматического начисления достижения при регистрации
CREATE OR REPLACE FUNCTION grant_first_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- При создании нового пользователя, дать ему достижение "1 месяц с нами"
  INSERT INTO achievements (user_id, name, icon, date_earned)
  SELECT NEW.id, name, icon, NOW()
  FROM achievement_templates
  WHERE name = '1 месяц с нами';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для вызова функции при создании пользователя
DROP TRIGGER IF EXISTS on_user_created_achievement ON users;
CREATE TRIGGER on_user_created_achievement
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION grant_first_achievement(); 