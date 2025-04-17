import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { CreateWorkoutData } from '@/lib/supabase/api';

// Константы для формы
const WORKOUT_TYPES = [
  { id: 'strength', label: 'СИЛОВАЯ' },
  { id: 'cardio', label: 'КАРДИО' },
  { id: 'hiit', label: 'HIIT (ИНТЕРВАЛЬНАЯ)' },
  { id: 'stretching', label: 'РАСТЯЖКА' },
];

const DURATIONS = [
  { id: 15, label: '15 МИНУТ' },
  { id: 30, label: '30 МИНУТ' },
  { id: 45, label: '45 МИНУТ' },
  { id: 60, label: '60 МИНУТ' },
  { id: 90, label: '90 МИНУТ' },
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
  { id: 'fullbody', label: 'ВСЁ ТЕЛО' },
];

interface CreateWorkoutFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (workoutData: CreateWorkoutData) => void;
  userId: string;
}

export const CreateWorkoutForm: React.FC<CreateWorkoutFormProps> = ({ visible, onClose, onSubmit, userId }) => {
  // Состояние формы
  const [type, setType] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  
  // Текущий шаг формы
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Обработчик выбора типа тренировки
  const handleTypeSelect = (typeId: string) => {
    setType(typeId);
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
    if (!type || !duration || inventory.length === 0 || targetMuscles.length === 0) {
      // Показываем ошибку (можно добавить состояние для ошибки)
      return;
    }
    
    const workoutData: CreateWorkoutData = {
      user_id: userId,
      type,
      duration,
      inventory,
      target_muscles: targetMuscles,
    };
    
    onSubmit(workoutData);
    resetForm();
  };
  
  // Сброс формы
  const resetForm = () => {
    setType('');
    setDuration(null);
    setInventory([]);
    setTargetMuscles([]);
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
          <Text style={styles.headerTitle}>РАЗОВАЯ ТРЕНИРОВКА</Text>
          <Text style={styles.step}>{currentStep}/{totalSteps}</Text>
        </View>
        
        <ScrollView style={styles.content}>
          {currentStep === 1 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ТИП ТРЕНИРОВКИ</Text>
              {WORKOUT_TYPES.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.optionButton, type === item.id && styles.selectedOption]}
                  onPress={() => handleTypeSelect(item.id)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {type === item.id && <AntDesign name="check" size={24} color="black" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {currentStep === 2 && (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>ДЛИТЕЛЬНОСТЬ</Text>
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
          
          {currentStep === 3 && (
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
          
          {currentStep === 4 && (
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
              
              <Text style={styles.summaryTitle}>ВЫБРАННЫЕ ПАРАМЕТРЫ:</Text>
              
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryItem}>
                  Тип: {WORKOUT_TYPES.find(t => t.id === type)?.label || ''}
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
                <Text style={styles.submitButtonText}>НАЧАТЬ ТРЕНИРОВКУ</Text>
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
    padding: 8,
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