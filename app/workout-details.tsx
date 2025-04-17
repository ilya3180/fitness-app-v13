import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getWorkoutDetails, updateWorkout, WorkoutDetails, WorkoutExerciseDetail } from '../lib/supabase/api';
import { useAuth } from '../lib/context/AuthContext';

// Компонент для отображения упражнения
const ExerciseItem = ({ 
  id,
  title, 
  sets, 
  reps, 
  weight,
  completed = false,
  onPress
}: { 
  id: string;
  title: string; 
  sets: number; 
  reps: number;
  weight: number;
  completed?: boolean;
  onPress: (id: string) => void;
}) => {
  return (
    <TouchableOpacity 
      style={[styles.exerciseItem, !completed && styles.exerciseItemIncomplete]}
      onPress={() => onPress(id)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseTitle}>{title}</Text>
        <Text style={styles.exerciseDetails}>
          {sets} подхода × {reps} повторений
          {weight > 0 ? ` • ${weight} кг` : ''}
        </Text>
      </View>
      <View style={styles.exerciseStatus}>
        {completed ? (
          <AntDesign name="check" size={24} color="#4CAF50" />
        ) : (
          <Feather name="x" size={24} color="#9E9E9E" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function WorkoutDetailsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string }>();
  const workoutId = params.id;

  const [workout, setWorkout] = useState<WorkoutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Загрузка деталей тренировки
  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      if (!workoutId) {
        Alert.alert('Ошибка', 'Идентификатор тренировки не найден');
        router.back();
        return;
      }

      setLoading(true);
      try {
        const details = await getWorkoutDetails(workoutId);
        if (details) {
          setWorkout(details);
        } else {
          Alert.alert('Ошибка', 'Не удалось загрузить данные тренировки');
          router.back();
        }
      } catch (error) {
        console.error('Ошибка при загрузке тренировки:', error);
        Alert.alert('Ошибка', 'Произошла ошибка при загрузке тренировки');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]);

  // Обработчик для кнопки "Назад"
  const handleGoBack = () => {
    router.back();
  };

  // Обработчик для перехода на экран деталей упражнения
  const handleExercisePress = (exerciseId: string) => {
    if (!workout) return;
    
    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    router.push({
      pathname: "/exercise-detail",
      params: {
        workout_id: workout.id,
        exercise_id: exercise.id,
        title: exercise.name,
        sets: exercise.sets.toString(),
        reps: exercise.reps.toString(),
        weight: exercise.weight.toString(),
        status: exercise.status
      }
    });
  };

  // Обработчик для завершения тренировки
  const handleCompleteWorkout = async (completeNow: boolean) => {
    if (!workout || !user) return;
    
    setUpdatingStatus(true);
    try {
      // Если completeNow = true, то считаем все упражнения выполненными
      // иначе, используем текущие статусы упражнений
      const exercises = workout.exercises.map(ex => ({
        id: ex.id,
        status: completeNow ? 'completed' : ex.status,
        actual_sets: completeNow ? ex.sets : ex.actual_sets,
        actual_reps: completeNow ? ex.reps : ex.actual_reps,
        actual_weight: completeNow ? ex.weight : ex.actual_weight
      }));

      const success = await updateWorkout(workout.id, {
        status: 'completed',
        exercises
      });

      if (success) {
        Alert.alert('Успех', 'Тренировка успешно завершена!');
        router.back();
      } else {
        Alert.alert('Ошибка', 'Не удалось завершить тренировку');
      }
    } catch (error) {
      console.error('Ошибка при завершении тренировки:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при завершении тренировки');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Загрузка тренировки...</Text>
      </View>
    );
  }

  // Если данные не загружены
  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные тренировки</Text>
        <TouchableOpacity style={styles.backButtonContainer} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>НАЗАД</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Определение количества завершенных упражнений
  const completedExercises = workout.exercises.filter(ex => ex.status === 'completed').length;
  const isWorkoutCompleted = workout.status === 'completed';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>УПРАЖНЕНИЯ</Text>
        <View style={{ width: 52 }} /> {/* Пустое место для баланса */}
      </View>
      
      <View style={styles.workoutContainer}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{workout.type.toUpperCase()}</Text>
          <View style={styles.workoutTitleUnderline} />
        </View>
        
        <Text style={styles.workoutInfo}>
          {workout.duration} минут • {workout.exercises.length} упражнений
        </Text>
        
        <View style={styles.exercisesList}>
          {workout.exercises.map((exercise) => (
            <ExerciseItem 
              key={exercise.id}
              id={exercise.id}
              title={exercise.name}
              sets={exercise.sets}
              reps={exercise.reps}
              weight={exercise.weight}
              completed={exercise.status === 'completed'}
              onPress={handleExercisePress}
            />
          ))}
        </View>
        
        {!isWorkoutCompleted && (
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Выполнено: {completedExercises} из {workout.exercises.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${(completedExercises / workout.exercises.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        {!isWorkoutCompleted && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.completeButton, updatingStatus && styles.disabledButton]}
              onPress={() => handleCompleteWorkout(false)}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.completeButtonText}>ЗАВЕРШИТЬ</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.completeNowButton, updatingStatus && styles.disabledButton]}
              onPress={() => handleCompleteWorkout(true)}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.completeNowButtonText}>ЗАВЕРШИТЬ СЕЙЧАС</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {isWorkoutCompleted && (
          <View style={styles.completedInfo}>
            <Text style={styles.completedText}>ТРЕНИРОВКА ЗАВЕРШЕНА</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    fontFamily: 'IBMPlexMono-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Regular',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonContainer: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    width: 200,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: 'IBMPlexMono-Black',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  workoutContainer: {
    margin: 16,
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
  },
  workoutHeader: {
    marginBottom: 10,
  },
  workoutTitle: {
    fontSize: 24,
    fontFamily: 'IBMPlexMono-Black',
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  workoutTitleUnderline: {
    height: 4,
    backgroundColor: '#000',
    marginVertical: 8,
  },
  workoutInfo: {
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Regular',
    marginBottom: 24,
  },
  exercisesList: {
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  exerciseItemIncomplete: {
    backgroundColor: '#f5f5f5',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  exerciseDetails: {
    fontSize: 14,
    fontFamily: 'IBMPlexMono-Regular',
  },
  exerciseStatus: {
    marginLeft: 10,
  },
  progressInfo: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Regular',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  completeNowButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeNowButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  disabledButton: {
    opacity: 0.5,
  },
  completedInfo: {
    alignItems: 'center',
    padding: 16,
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#4CAF50',
  },
  completedText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
}); 