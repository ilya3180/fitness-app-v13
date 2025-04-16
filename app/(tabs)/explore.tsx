import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5, AntDesign, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

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
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>ТРЕНИРОВКА</Text>
      <View style={styles.headerDivider} />
      
      {/* Секция ТЕКУЩИЙ ПЛАН */}
      <View style={styles.sectionOuterContainer}>
        <View style={styles.sectionTitleOuterContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>ТЕКУЩИЙ ПЛАН</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionContent}>
            <View style={styles.currentPlanContainer}>
              <Text style={styles.currentPlanTitle}>НАБОР МЫШЕЧНОЙ МАССЫ</Text>
              
              <Text style={styles.currentPlanDescription}>
                Средний уровень • 4 недели • 3 тренировки в неделю
              </Text>
              
              <Text style={styles.progressText}>ПРОГРЕСС: 5/12 ТРЕНИРОВОК</Text>
              
              <ProgressBar progress={42} />
              
              <Link href="/workout-details" asChild>
                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>НАЧАТЬ ТРЕНИРОВКУ</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
      
      {/* Блоки быстрых действий */}
      <ActionBlock 
        icon={<AntDesign name="plus" size={24} color="black" />} 
        title="СОЗДАТЬ ПЛАН" 
      />
      
      <ActionBlock 
        icon={<FontAwesome5 name="bolt" size={24} color="black" />} 
        title="РАЗОВАЯ ТРЕНИРОВКА" 
        href="/workout-details"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
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
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionBlock: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  actionBlockContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBlockTitle: {
    fontSize: 20, // text-xl (1.25rem)
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  recommendationBlock: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  recommendationTitle: {
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Bold',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  recommendationDescription: {
    fontSize: 14, // text-sm (0.875rem)
    fontFamily: 'IBMPlexMono-Regular',
  }
});
