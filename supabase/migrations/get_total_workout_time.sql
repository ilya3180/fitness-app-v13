-- Функция для подсчета общего времени тренировок пользователя
CREATE OR REPLACE FUNCTION get_total_workout_time(user_id_param UUID)
RETURNS TABLE (total_time INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(duration), 0)::INTEGER AS total_time
  FROM workouts
  WHERE user_id = user_id_param AND status = 'completed';
END;
$$ LANGUAGE plpgsql; 