import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { AntDesign, Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// Компонент для отображения блока инструкций
const InstructionBlock = ({ text }: { text: string }) => {
  return (
    <View style={styles.instructionBlock}>
      <View style={styles.instructionIconContainer}>
        <Ionicons name="information-circle" size={24} color="black" />
      </View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
};

// Компонент для отображения параметра упражнения
const ExerciseParam = ({ 
  label, 
  value 
}: { 
  label: string; 
  value: string;
}) => {
  return (
    <View style={styles.paramBlock}>
      <Text style={styles.paramLabel}>{label}</Text>
      <Text style={styles.paramValue}>{value}</Text>
    </View>
  );
};

// Компонент для отображения целевой мышцы
const TargetMuscle = ({ name }: { name: string }) => {
  return (
    <View style={styles.muscleTag}>
      <Text style={styles.muscleTagText}>{name}</Text>
    </View>
  );
};

// Компонент для ввода данных
const DataInput = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string;
  onChange: (text: string) => void;
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
      />
    </View>
  );
};

export default function ExerciseDetailScreen() {
  // Получаем параметры из маршрута
  const params = useLocalSearchParams();
  
  // Устанавливаем начальные значения из параметров или используем значения по умолчанию
  const exerciseTitle = params.title as string || 'ЖИМ ГАНТЕЛЕЙ ЛЕЖА';
  const exerciseSets = params.sets as string || '3';
  const exerciseReps = params.reps as string || '12';
  const isCompleted = params.completed === 'true';
  
  // Состояния для ввода фактических данных
  const [sets, setSets] = useState(exerciseSets);
  const [reps, setReps] = useState(exerciseReps);
  const [weight, setWeight] = useState('10');
  
  // Обработчик для кнопки "Назад"
  const handleGoBack = () => {
    router.back();
  };

  // Обработчик для кнопки "Отметить выполненным"
  const handleComplete = () => {
    // TODO: Сохранить данные о выполнении упражнения
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>УПРАЖНЕНИЕ</Text>
        <View style={{ width: 52 }} /> {/* Пустое место для баланса */}
      </View>
      
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle}>{exerciseTitle}</Text>
        
        {/* Изображение упражнения */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <AntDesign name="picture" size={48} color="#ccc" />
          </View>
        </View>
        
        {/* Инструкция по выполнению */}
        <InstructionBlock 
          text="Лягте на скамью, держа гантели на уровне груди. Выжмите гантели вверх до полного выпрямления рук, затем медленно опустите обратно."
        />
        
        {/* Параметры упражнения */}
        <View style={styles.paramsSection}>
          <View style={styles.paramsRow}>
            <ExerciseParam label="ПОДХОДЫ" value={exerciseSets} />
            <ExerciseParam label="ПОВТОРЕНИЯ" value={exerciseReps} />
          </View>
          <View style={styles.paramsRow}>
            <ExerciseParam label="ВЕС" value="10–15 кг" />
            <ExerciseParam label="ОТДЫХ" value="60–90 секунд" />
          </View>
        </View>
        
        {/* Целевые мышцы */}
        <View style={styles.targetMusclesSection}>
          <Text style={styles.sectionTitle}>ЦЕЛЕВЫЕ МЫШЦЫ</Text>
          <View style={styles.musclesContainer}>
            <TargetMuscle name="Грудные" />
            <TargetMuscle name="Трицепс" />
            <TargetMuscle name="Передние дельты" />
          </View>
        </View>
        
        {/* Советы */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>СОВЕТЫ</Text>
          <View style={styles.tipsBlock}>
            <Text style={styles.tipsText}>
              Держите локти под углом 45° к телу. Не опускайте гантели слишком низко, чтобы избежать травм плеч.
            </Text>
          </View>
        </View>
        
        {/* Фактические данные */}
        <View style={styles.actualDataSection}>
          <Text style={styles.sectionTitle}>ФАКТИЧЕСКИЕ ДАННЫЕ</Text>
          <View style={styles.inputsRow}>
            <DataInput label="ПОДХОДЫ" value={sets} onChange={setSets} />
            <DataInput label="ПОВТОРЕНИЯ" value={reps} onChange={setReps} />
            <DataInput label="ВЕС (КГ)" value={weight} onChange={setWeight} />
          </View>
        </View>
        
        {/* Кнопка действия */}
        <TouchableOpacity style={styles.markCompleteButton} onPress={handleComplete}>
          <Text style={styles.markCompleteButtonText}>ОТМЕТИТЬ ВЫПОЛНЕННЫМ</Text>
        </TouchableOpacity>
      </View>
      
      {/* Добавляем отступ снизу для лучшего скроллинга */}
      <View style={{ height: 80 }} />
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
  exerciseContainer: {
    margin: 16,
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
  },
  exerciseTitle: {
    fontSize: 24,
    fontFamily: 'IBMPlexMono-Black',
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#000',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  instructionBlock: {
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  instructionIconContainer: {
    marginRight: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Regular',
  },
  paramsSection: {
    marginBottom: 16,
  },
  paramsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paramBlock: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    width: '48%',
    backgroundColor: '#f5f5f5',
  },
  paramLabel: {
    fontSize: 12,
    fontFamily: 'IBMPlexMono-Bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  paramValue: {
    fontSize: 24,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
  },
  targetMusclesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  muscleTagText: {
    fontSize: 14,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipsBlock: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'IBMPlexMono-Regular',
  },
  actualDataSection: {
    marginBottom: 16,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 12,
    width: '32%',
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'IBMPlexMono-Bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    fontSize: 24,
    fontFamily: 'IBMPlexMono-Bold',
    textAlign: 'center',
  },
  markCompleteButton: {
    backgroundColor: '#D32F2F',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  markCompleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
}); 