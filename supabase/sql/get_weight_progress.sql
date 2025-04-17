-- Функция для получения прогресса веса в упражнениях
CREATE OR REPLACE FUNCTION get_weight_progress(user_id_param UUID)
RETURNS TABLE (
  exercise_id UUID,
  initial_weight FLOAT,
  latest_weight FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH exercise_weight_data AS (
    SELECT 
      we.exercise_id,
      we.weight,
      w.date,
      ROW_NUMBER() OVER (PARTITION BY we.exercise_id ORDER BY w.date ASC) as first_rank,
      ROW_NUMBER() OVER (PARTITION BY we.exercise_id ORDER BY w.date DESC) as last_rank
    FROM workout_exercises we
    JOIN workouts w ON we.workout_id = w.id
    WHERE w.user_id = user_id_param
      AND we.weight IS NOT NULL
      AND we.weight > 0
      AND w.status = 'completed'
  )
  SELECT 
    ewd1.exercise_id,
    ewd1.weight as initial_weight,
    ewd2.weight as latest_weight
  FROM 
    exercise_weight_data ewd1
  JOIN 
    exercise_weight_data ewd2 ON ewd1.exercise_id = ewd2.exercise_id
  WHERE 
    ewd1.first_rank = 1
    AND ewd2.last_rank = 1;
END;
$$ LANGUAGE plpgsql; 