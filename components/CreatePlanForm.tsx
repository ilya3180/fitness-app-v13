import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { CreatePlanData } from '@/lib/supabase/api';

// Константы для формы
const GOALS = [
  { id: 'strength', label: 'СИЛА' },
  { id: 'muscle', label: 'МАССА' },
  { id: 'weight_loss', label: 'ПОХУДЕНИЕ' },
  { id: 'endurance', label: 'ВЫНОСЛИВОСТЬ' },
];

const LEVELS = [
  { id: 'beginner', label: 'НАЧИНАЮЩИЙ' },
  { id: 'intermediate', label: 'СРЕДНИЙ' },
  { id: 'advanced', label: 'ПРОДВИНУТЫЙ' },
];

const FREQUENCIES = [
  { id: 2, label: '2 РАЗА В НЕДЕЛЮ' },
  { id: 3, label: '3 РАЗА В НЕДЕЛЮ' },
  { id: 4, label: '4 РАЗА В НЕДЕЛЮ' },
  { id: 5, label: '5 РАЗ В НЕДЕЛЮ' },
];

const DURATIONS = [
  { id: 2, label: '2 НЕДЕЛИ' },
  { id: 4, label: '4 НЕДЕЛИ' },
  { id: 8, label: '8 НЕДЕЛЬ' },
  { id: 12, label: '12 НЕДЕЛЬ' },
];

const INVENTORY = [
  { id: 'none', label: 'БЕЗ ИНВЕНТАРЯ' },
  { id: 'dumbbells', label: 'ГАНТЕЛИ' },
  { id: 'barbell', label: 'ШТАНГА' },
  { id: 'kettlebell', label: 'ГИРЯ' },
  { id: 'bands', label: 'РЕЗИНКИ' },
  { id: 'gym', label: 'ТРЕНАЖЕРЫ' },
];

const MUSCLES = [
  { id: 'chest', label: 'ГРУДЬ' },
  { id: 'back', label: 'СПИНА' },
  { id: 'shoulders', label: 'ПЛЕЧИ' },
  { id: 'arms', label: 'РУКИ' },
  { id: 'legs', label: 'НОГИ' },
  { id: 'abs', label: 'ПРЕСС' },
];

interface CreatePlanFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (planData: CreatePlanData) => void;
  userId: string;
}

export const CreatePlanForm: React.FC<CreatePlanFormProps> = ({ visible, onClose, onSubmit, userId }) => {
  // Состояние формы
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [frequency, setFrequency] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [planName, setPlanName] = useState('');
  
  // Текущий шаг формы
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  // Обработчик выбора цели
  const handleGoalSelect = (goalId: string) => {
    setGoal(goalId);
    nextStep();
  };
  
  // Обработчик выбора уровня
  const handleLevelSelect = (levelId: string) => {
    setLevel(levelId);
    nextStep();
  };
  
  // Обработчик выбора частоты
  const handleFrequencySelect = (freq: number) => {
    setFrequency(freq);
    nextStep();
  };
  
  // Обработчик выбора длительности
  const handleDurationSelect = (dur: number) => {
    setDuration(dur);
    nextStep();
  };
  
  // Обработчик выбора инвентаря
  const handleInventoryToggle = (invId: string) => {
    if (inventory.includes(invId)) {
      setInventory(inventory.filter(id => id !== invId));
    } else {
      setInventory([...inventory, invId]);
    }
  };
  
  // Обработчик выбора целевых мышц
  const handleMusclesToggle = (muscleId: string) => {
    if (targetMuscles.includes(muscleId)) {
      setTargetMuscles(targetMuscles.filter(id => id !== muscleId));
    } else {
      setTargetMuscles([...targetMuscles, muscleId]);
    }
  };
  
  // Переход к следующему шагу
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Переход к предыдущему шагу
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };
  
  // Отправка формы
  const handleSubmit = () => {
    if (!goal || !level || !frequency || !duration || inventory.length === 0 || targetMuscles.length === 0) {
      // Показываем ошибку (можно добавить состояние для ошибки)
      return;
    }
    
    const planData: CreatePlanData = {
      user_id: userId,
      goal,
      level,
      frequency,
      duration,
      inventory,
      target_muscles: targetMuscles,
      name: planName || `${GOALS.find(g => g.id === goal)?.label || 'МОЙ'} ПЛАН`
    };
    
    onSubmit(planData);
    resetForm();
  };
  
  // Сброс формы
  const resetForm = () => {
    setGoal('');
    setLevel('');
    setFrequency(null);
    setDuration(null);
    setInventory([]);
    setTargetMuscles([]);
    setPlanName('');
    setCurrentStep(1);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevStep} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>СОЗДАНИЕ ПЛАНА</Text>
          <Text style={styles.step}>{currentStep}/{totalSteps}</Text>
        </View>
        
        <ScrollView style={styles.content}>
          {currentStep === 1 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ВЫБЕРИТЕ ЦЕЛЬ</Text>
              {GOALS.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, goal === item.id && styles.selectedOption]}
                  onPress={() => handleGoalSelect(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {goal === item.id && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {currentStep === 2 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ВЫБЕРИТЕ УРОВЕНЬ</Text>
              {LEVELS.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, level === item.id && styles.selectedOption]}
                  onPress={() => handleLevelSelect(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {level === item.id && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {currentStep === 3 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ЧАСТОТА ТРЕНИРОВОК</Text>
              {FREQUENCIES.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, frequency === item.id && styles.selectedOption]}
                  onPress={() => handleFrequencySelect(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {frequency === item.id && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {currentStep === 4 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ДЛИТЕЛЬНОСТЬ ПЛАНА</Text>
              {DURATIONS.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, duration === item.id && styles.selectedOption]}
                  onPress={() => handleDurationSelect(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {duration === item.id && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {currentStep === 5 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ДОСТУПНЫЙ ИНВЕНТАРЬ</Text>
              <Text style={styles.formSubtitle}>Выберите всё, что у вас есть</Text>
              
              {INVENTORY.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, inventory.includes(item.id) && styles.selectedOption]}
                  onPress={() => handleInventoryToggle(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {inventory.includes(item.id) && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>ДАЛЕЕ</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {currentStep === 6 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ЦЕЛЕВЫЕ МЫШЦЫ</Text>
              <Text style={styles.formSubtitle}>Выберите, что хотите тренировать</Text>
              
              {MUSCLES.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, targetMuscles.includes(item.id) && styles.selectedOption]}
                  onPress={() => handleMusclesToggle(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {targetMuscles.includes(item.id) && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>ДАЛЕЕ</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {currentStep === 7 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>НАЗВАНИЕ ПЛАНА</Text>
              <TextInput
                style={styles.input}
                value={planName}
                onChangeText={setPlanName}
                placeholder="МОЙ ТРЕНИРОВОЧНЫЙ ПЛАН"
                placeholderTextColor="#999"
              />
              
              <Text style={styles.summaryTitle}>ВЫБРАННЫЕ ПАРАМЕТРЫ:</Text>
              
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryItem}>
                  Цель: {GOALS.find(g => g.id === goal)?.label || ''}
                </Text>
                <Text style={styles.summaryItem}>
                  Уровень: {LEVELS.find(l => l.id === level)?.label || ''}
                </Text>
                <Text style={styles.summaryItem}>
                  Частота: {FREQUENCIES.find(f => f.id === frequency)?.label || ''}
                </Text>
                <Text style={styles.summaryItem}>
                  Длительность: {DURATIONS.find(d => d.id === duration)?.label || ''}
                </Text>
                <Text style={styles.summaryItem}>
                  Инвентарь: {inventory.map(i => INVENTORY.find(item => item.id === i)?.label).join(', ')}
                </Text>
                <Text style={styles.summaryItem}>
                  Мышцы: {targetMuscles.map(m => MUSCLES.find(item => item.id === m)?.label).join(', ')}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>СОЗДАТЬ ПЛАН</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  backButton: {
    padding: this,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'IBMPlexMono-Bold',
  },
  step: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'IBMPlexMono-Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    fontFamily: 'IBMPlexMono-Bold',
  },
  formSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'IBMPlexMono-Regular',
  },
  optionButton: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#ffebee',
    borderColor: '#D32F2F',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'IBMPlexMono-Bold',
  },
  nextButton: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'IBMPlexMono-Bold',
  },
  input: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 20,
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Regular',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    fontFamily: 'IBMPlexMono-Bold',
  },
  summaryContainer: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  summaryItem: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'IBMPlexMono-Regular',
  },
  submitButton: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'IBMPlexMono-Bold',
  },
}); 