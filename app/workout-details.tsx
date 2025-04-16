import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

// Компонент для отображения упражнения
const ExerciseItem = ({ 
  title, 
  sets, 
  reps, 
  completed = false 
}: { 
  title: string; 
  sets: number; 
  reps: number; 
  completed?: boolean;
}) => {
  // Добавляем обработчик для перехода на страницу с деталями упражнения
  const handlePress = () => {
    // Передаем данные об упражнении в параметрах навигации
    const params = { 
      title, 
      sets: sets.toString(), 
      reps: reps.toString(),
      completed: completed ? 'true' : 'false'
    };
    
    router.push({
      pathname: "/exercise-detail" as any,
      params
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.exerciseItem, !completed && styles.exerciseItemIncomplete]}
      onPress={handlePress}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseTitle}>{title}</Text>
        <Text style={styles.exerciseDetails}>{sets} подхода × {reps} повторений</Text>
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
  // Обработчик для кнопки "Назад"
  const handleGoBack = () => {
    router.back();
  };

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
          <Text style={styles.workoutTitle}>СИЛОВАЯ (ВЕРХ ТЕЛА)</Text>
          <View style={styles.workoutTitleUnderline} />
        </View>
        
        <Text style={styles.workoutInfo}>30 минут • 5 упражнений</Text>
        
        <View style={styles.exercisesList}>
          <ExerciseItem 
            title="Жим гантелей лежа" 
            sets={3} 
            reps={12} 
            completed={true} 
          />
          
          <ExerciseItem 
            title="Тяга гантелей в наклоне" 
            sets={3} 
            reps={10} 
            completed={true} 
          />
          
          <ExerciseItem 
            title="Жим гантелей от плеч" 
            sets={3} 
            reps={10} 
          />
          
          <ExerciseItem 
            title="Подъем гантелей на бицепс" 
            sets={3} 
            reps={12} 
          />
          
          <ExerciseItem 
            title="Разгибание рук на трицепс" 
            sets={3} 
            reps={12} 
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>ЗАВЕРШИТЬ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.completeNowButton}>
            <Text style={styles.completeNowButtonText}>ЗАВЕРШИТЬ СЕЙЧАС</Text>
          </TouchableOpacity>
        </View>
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
  },
  completeNowButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
}); 