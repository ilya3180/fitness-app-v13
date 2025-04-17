import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5, AntDesign, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { ProfileMenu } from '@/components/ProfileMenu';
import { CreatePlanForm } from '@/components/CreatePlanForm';
import { CreateWorkoutForm } from '@/components/CreateWorkoutForm';
import { useSupabaseAuth } from '@/hooks/useSupabase';
import { getActivePlan, createPlan, createWorkout, ActivePlan, CreatePlanData, CreateWorkoutData } from '@/lib/supabase/api';
import { useFocusEffect } from '@react-navigation/native';

// Компонент прогресс-бара в брутальном стиле
const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );
};

// Компонент блока действия с иконкой и стрелкой
const ActionBlock = ({ 
  icon, 
  title, 
  onPress,
  href
}: { 
  icon: React.ReactNode; 
  title: string; 
  onPress?: () => void;
  href?: string;
}) => {
  if (href) {
    return (
      <Link href={href} asChild>
        <TouchableOpacity style={styles.actionBlock}>
          <View style={styles.actionBlockContent}>
            {icon}
            <Text style={styles.actionBlockTitle}>{title}</Text>
          </View>
          <AntDesign name="right" size={24} color="black" />
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity style={styles.actionBlock} onPress={onPress}>
      <View style={styles.actionBlockContent}>
        {icon}
        <Text style={styles.actionBlockTitle}>{title}</Text>
      </View>
      <AntDesign name="right" size={24} color="black" />
    </TouchableOpacity>
  );
};

// Компонент блока рекомендации
const RecommendationBlock = ({ 
  title, 
  description 
}: { 
  title: string; 
  description: string;
}) => {
  return (
    <View style={styles.recommendationBlock}>
      <Text style={styles.recommendationTitle}>{title}</Text>
      <Text style={styles.recommendationDescription}>{description}</Text>
    </View>
  );
};

export default function WorkoutScreen() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  // Состояния
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [showCreatePlanForm, setShowCreatePlanForm] = useState(false);
  const [showCreateWorkoutForm, setShowCreateWorkoutForm] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [creatingWorkout, setCreatingWorkout] = useState(false);
  
  // Загрузка активного плана тренировок
  const loadActivePlan = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const plan = await getActivePlan(user.id);
      setActivePlan(plan);
    } catch (error) {
      console.error('Ошибка при загрузке активного плана:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Загружаем данные при монтировании и при фокусе на экране
  useEffect(() => {
    loadActivePlan();
  }, [loadActivePlan]);
  
  useFocusEffect(
    useCallback(() => {
      loadActivePlan();
    }, [loadActivePlan])
  );
  
  // Обработчик создания плана
  const handleCreatePlan = async (planData: CreatePlanData) => {
    if (!user) return;
    
    try {
      setCreatingPlan(true);
      const result = await createPlan(planData);
      
      if (result) {
        console.log('План успешно создан:', result);
        Alert.alert('Успех', 'План тренировок успешно создан!');
        
        // Напрямую устанавливаем план как активный, используя данные из результата
        // Это позволит мгновенно отобразить созданный план без ожидания обновления с сервера
        const newPlan: ActivePlan = {
          id: result.plan_id,
          name: planData.name || planData.goal.toUpperCase(), // Используем заданное имя плана или цель
          goal: planData.goal,
          level: planData.level,
          frequency: planData.frequency,
          duration: planData.duration,
          progress: 0, // Новый план, прогресс 0
          workouts: result.workouts || []
        };
        
        setActivePlan(newPlan);
        
        // Дополнительно обновляем через небольшую задержку,
        // чтобы подтянуть актуальные данные с сервера
        setTimeout(() => {
          loadActivePlan();
        }, 1000); // Увеличиваем время задержки для надежности
      } else {
        console.error('Не удалось создать план, результат:', result);
        Alert.alert('Ошибка', 'Не удалось создать план тренировок');
      }
    } catch (error) {
      console.error('Ошибка при создании плана:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании плана');
    } finally {
      setCreatingPlan(false);
      setShowCreatePlanForm(false);
    }
  };
  
  // Обработчик создания разовой тренировки
  const handleCreateWorkout = async (workoutData: CreateWorkoutData) => {
    if (!user) return;
    
    try {
      setCreatingWorkout(true);
      const result = await createWorkout(workoutData);
      
      if (result) {
        // Переходим на экран тренировки
        router.push({
          pathname: '/workout-details',
          params: { workout_id: result.workout_id }
        });
      } else {
        Alert.alert('Ошибка', 'Не удалось создать тренировку');
      }
    } catch (error) {
      console.error('Ошибка при создании тренировки:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании тренировки');
    } finally {
      setCreatingWorkout(false);
      setShowCreateWorkoutForm(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ProfileMenu />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <Text style={styles.headerTitle}>ТРЕНИРОВКА</Text>
          <View style={styles.headerDivider} />
          
          {/* Секция ТЕКУЩИЙ ПЛАН */}
          {activePlan ? (
            <View style={styles.sectionOuterContainer}>
              <View style={styles.sectionTitleOuterContainer}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>ТЕКУЩИЙ ПЛАН</Text>
                </View>
              </View>
              
              <View style={styles.sectionContainer}>
                <View style={styles.sectionContent}>
                  <View style={styles.currentPlanContainer}>
                    <Text style={styles.currentPlanTitle}>{activePlan.name}</Text>
                    
                    <Text style={styles.currentPlanDescription}>
                      {activePlan.level.charAt(0).toUpperCase() + activePlan.level.slice(1)} уровень • {activePlan.duration} недель • {activePlan.frequency} тренировок в неделю
                    </Text>
                    
                    <Text style={styles.progressText}>
                      ПРОГРЕСС: {activePlan.workouts.filter(w => w.status === 'completed').length}/{activePlan.workouts.length} ТРЕНИРОВОК
                    </Text>
                    
                    <ProgressBar progress={activePlan.progress} />
                    
                    {/* Находим ближайшую не выполненную тренировку */}
                    {activePlan.workouts.find(w => w.status !== 'completed') && (
                      <Link 
                        href={{
                          pathname: '/workout-details',
                          params: { 
                            workout_id: activePlan.workouts.find(w => w.status !== 'completed')?.id
                          }
                        }} 
                        asChild
                      >
                        <TouchableOpacity style={styles.startButton}>
                          <Text style={styles.startButtonText}>НАЧАТЬ ТРЕНИРОВКУ</Text>
                        </TouchableOpacity>
                      </Link>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noPlanContainer}>
              <Text style={styles.noPlanText}>У вас пока нет активного тренировочного плана</Text>
              <TouchableOpacity 
                style={styles.createPlanButton}
                onPress={() => setShowCreatePlanForm(true)}
              >
                <Text style={styles.createPlanButtonText}>СОЗДАТЬ ПЛАН</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Блоки быстрых действий */}
          <ActionBlock 
            icon={<AntDesign name="plus" size={24} color="black" />} 
            title="СОЗДАТЬ ПЛАН" 
            onPress={() => setShowCreatePlanForm(true)}
          />
          
          <ActionBlock 
            icon={<FontAwesome5 name="bolt" size={24} color="black" />} 
            title="РАЗОВАЯ ТРЕНИРОВКА" 
            onPress={() => setShowCreateWorkoutForm(true)}
          />
          
          {/* Секция РЕКОМЕНДАЦИИ */}
          <View style={styles.sectionOuterContainer}>
            <View style={styles.sectionTitleOuterContainer}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>РЕКОМЕНДАЦИИ</Text>
              </View>
            </View>
            
            <View style={styles.sectionContainer}>
              <View style={styles.sectionContent}>
                <RecommendationBlock 
                  title="УВЕЛИЧЬТЕ ВЕС В ЖИМЕ ЛЕЖА" 
                  description="Вы легко выполняете текущий вес. Попробуйте добавить 5–10%."
                />
                
                <RecommendationBlock 
                  title="ДОБАВЬТЕ КАРДИО" 
                  description="Для вашей цели рекомендуется 2 кардио-тренировки в неделю."
                />
              </View>
            </View>
          </View>
          
          {/* Добавляем отступ снизу для лучшего скроллинга */}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
      
      {/* Модальные окна для создания плана и тренировки */}
      {user && (
        <>
          <CreatePlanForm 
            visible={showCreatePlanForm} 
            onClose={() => setShowCreatePlanForm(false)}
            onSubmit={handleCreatePlan}
            userId={user.id}
          />
          
          <CreateWorkoutForm 
            visible={showCreateWorkoutForm} 
            onClose={() => setShowCreateWorkoutForm(false)}
            onSubmit={handleCreateWorkout}
            userId={user.id}
          />
        </>
      )}
      
      {/* Индикатор загрузки при создании плана/тренировки */}
      {(creatingPlan || creatingWorkout) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>
            {creatingPlan ? 'Создание плана...' : 'Создание тренировки...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
    fontFamily: 'IBMPlexMono-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Regular',
  },
  headerTitle: {
    fontSize: 48, // text-5xl (3rem)
    fontFamily: 'IBMPlexMono-Black',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: -1, // tracking-tighter
  },
  headerDivider: {
    height: 6,
    backgroundColor: 'black',
    marginBottom: 20,
  },
  noPlanContainer: {
    margin: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  createPlanButton: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  createPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'IBMPlexMono-Bold',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionOuterContainer: {
    marginBottom: 20,
    marginHorizontal: 16,
    paddingTop: 20, // Добавляем отступ сверху для заголовка
  },
  sectionTitleOuterContainer: {
    height: 20, // Фиксированная высота для заголовка
    position: 'relative',
    zIndex: 2,
  },
  sectionContainer: {
    borderWidth: 3,
    borderColor: '#000',
    marginTop: -10, // Смещаем немного вверх, чтобы заголовок наложился на рамку
  },
  sectionContent: {
    padding: 16,
    paddingTop: 25, // Увеличиваем верхний отступ, чтобы не перекрывать заголовок
  },
  sectionTitleContainer: {
    position: 'absolute',
    top: -15,
    left: 10,
    zIndex: 3,
  },
  sectionTitle: {
    fontSize: 24, // text-2xl (1.5rem)
    fontFamily: 'IBMPlexMono-Black',
    fontWeight: '900',
    borderWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  currentPlanContainer: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  currentPlanTitle: {
    fontSize: 20, // text-xl (1.25rem)
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  currentPlanDescription: {
    fontSize: 16, // 1rem
    fontFamily: 'IBMPlexMono-Regular',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16, // 1rem
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    height: 30,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D32F2F',
  },
  startButton: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'IBMPlexMono-Bold',
  },
  actionBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  actionBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBlockTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    fontFamily: 'IBMPlexMono-Bold',
  },
  recommendationBlock: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'IBMPlexMono-Bold',
  },
  recommendationDescription: {
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Regular',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    fontFamily: 'IBMPlexMono-Bold',
  },
});
