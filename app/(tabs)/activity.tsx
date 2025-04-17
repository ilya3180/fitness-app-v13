import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useSupabaseAuth } from '@/hooks/useSupabase';
import { getUserStats, getWorkoutHistory, formatTime, formatWorkoutDate, getRegularity, getAchievements } from '@/lib/supabase/api';
import { UserStats, WorkoutHistoryItem, RegularityData, Achievement } from '@/lib/supabase/api';
import { cacheUserStats, cacheRegularity, cacheAchievements, cacheWorkoutHistory, 
  getCachedUserStats, getCachedRegularity, getCachedAchievements, getCachedWorkoutHistory } from '@/lib/cache';
import { useFocusEffect } from '@react-navigation/native';

const ACCENT = '#D13F32';
const BORDER = '#000';
const BG = '#fff';
const GREY = '#F3F4F6';

export default function ActivityScreen() {
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState<UserStats>({ workouts: 0, total_time: 0, progress: 0, badges: 0 });
  const [regularity, setRegularity] = useState<RegularityData>({ dates: [] });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Функция для получения всех данных
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Получаем текущую дату и даты для календаря (35 дней назад)
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 34); // 35 дней (5 недель для календаря)
      
      const formatDateForAPI = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };
      
      // Формируем даты для API
      const endDateStr = formatDateForAPI(today);
      const startDateStr = formatDateForAPI(startDate);
      
      // Пытаемся загрузить данные из кэша, если не получилось - загружаем с сервера
      let statsData: UserStats | null = await getCachedUserStats<UserStats>(user.id);
      let regularityData: RegularityData | null = await getCachedRegularity<RegularityData>(user.id);
      let achievementsData: Achievement[] | null = await getCachedAchievements<Achievement[]>(user.id);
      let historyData: WorkoutHistoryItem[] | null = await getCachedWorkoutHistory<WorkoutHistoryItem[]>(user.id);
      
      // Если в кэше нет данных или обновляем данные, загружаем с сервера
      if (!statsData || refreshing) {
        statsData = await getUserStats(user.id);
        await cacheUserStats(statsData, user.id);
      }
      
      if (!regularityData || refreshing) {
        regularityData = await getRegularity(user.id, startDateStr, endDateStr);
        await cacheRegularity(regularityData, user.id);
      }
      
      if (!achievementsData || refreshing) {
        achievementsData = await getAchievements(user.id);
        await cacheAchievements(achievementsData, user.id);
      }
      
      if (!historyData || refreshing) {
        historyData = await getWorkoutHistory(user.id, 5); // Загружаем 5 последних тренировок
        await cacheWorkoutHistory(historyData, user.id);
      }
      
      // Обновляем состояние компонента
      setStats(statsData);
      setRegularity(regularityData);
      setAchievements(achievementsData);
      setWorkoutHistory(historyData);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);
  
  // Обновляем данные при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );
  
  // Обработчик обновления данных (pull-to-refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);
  
  // Проверяем, содержит ли массив регулярности указанную дату
  const isDateInRegularity = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    return regularity.dates.includes(dateString);
  }, [regularity.dates]);
  
  // Генерируем данные для календаря
  const calendarDates = useCallback(() => {
    const today = new Date();
    const result = [];
    
    // Генерируем даты для последних 5 недель (35 дней)
    for (let week = 0; week < 5; week++) {
      const weekDates = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (4 - week) * 7 - (6 - day));
        weekDates.push({
          date,
          filled: isDateInRegularity(date)
        });
      }
      result.push(weekDates);
    }
    
    return result;
  }, [isDateInRegularity]);
  
  // Если загрузка и нет данных в кэше, показываем спиннер
  if (loading && !refreshing) {
    return (
      <Container>
        <ProfileMenu />
        <LoadingContainer>
          <ActivityIndicator size="large" color={ACCENT} />
          <LoadingText>Загрузка данных...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ProfileMenu />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title>АКТИВНОСТЬ</Title>
        <BlackLine />
        <Section>
          <SectionTitle>СТАТИСТИКА</SectionTitle>
          <StatsRow>
            <StatBox>
              <StatValue>{stats.workouts}</StatValue>
              <StatLabel>ТРЕНИРОВОК</StatLabel>
            </StatBox>
            <StatBox>
              <StatValue>{formatTime(stats.total_time)}</StatValue>
              <StatLabel>ОБЩЕЕ ВРЕМЯ</StatLabel>
            </StatBox>
          </StatsRow>
          <ProgressSection>
            <ProgressLabel>ПРОГРЕСС К ЦЕЛИ</ProgressLabel>
            <ProgressBarBox>
              <ProgressBar>
                <ProgressFill style={{ width: `${stats.progress}%` }}>
                  <ProgressText>{stats.progress}%</ProgressText>
                </ProgressFill>
                <ProgressEmpty style={{ width: `${100 - stats.progress}%` }} />
              </ProgressBar>
            </ProgressBarBox>
          </ProgressSection>
        </Section>
        <Section>
          <SectionTitle>РЕГУЛЯРНОСТЬ</SectionTitle>
          <CalendarGrid>
            {calendarDates().map((week, rowIndex) => (
              <CalendarRow key={rowIndex}>
                {week.map((day, colIndex) => (
                  <CalendarCell key={colIndex} filled={day.filled} />
                ))}
              </CalendarRow>
            ))}
          </CalendarGrid>
        </Section>
        <Section>
          <SectionTitle>ДОСТИЖЕНИЯ</SectionTitle>
          <AchievementsGrid>
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <AchievementBox key={achievement.id}>
                  {achievement.icon === 'medal-outline' && <MaterialCommunityIcons name="medal-outline" size={36} color="#000" />}
                  {achievement.icon === 'clock' && <Feather name="clock" size={36} color="#000" />}
                  {achievement.icon === 'chart-line' && <FontAwesome5 name="chart-line" size={32} color="#000" />}
                  {achievement.icon === 'calendar' && <Feather name="calendar" size={36} color="#000" />}
                  <AchievementText>{achievement.name}</AchievementText>
            </AchievementBox>
              ))
            ) : (
              <EmptyStateText>У вас пока нет достижений. Продолжайте тренироваться!</EmptyStateText>
            )}
          </AchievementsGrid>
        </Section>
        <Section>
          <SectionTitle>ИСТОРИЯ</SectionTitle>
          {workoutHistory.length > 0 ? (
            workoutHistory.map((workout) => (
              <WorkoutCard key={workout.id}>
            <WorkoutTitleRow>
                  <WorkoutTitle>{workout.type.toUpperCase()}</WorkoutTitle>
                  <WorkoutTag>{formatWorkoutDate(workout.date)}</WorkoutTag>
            </WorkoutTitleRow>
                <WorkoutDesc>
                  {/* Тут можно добавить дополнительную информацию о тренировке */}
                  {workout.duration} мин • {workout.calories ? `${workout.calories} ккал` : 'без калорий'}
                </WorkoutDesc>
          </WorkoutCard>
            ))
          ) : (
            <EmptyStateText>У вас пока нет завершенных тренировок</EmptyStateText>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

// Дополнительные стили
const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 16px;
  font-size: 16px;
  color: #000;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
  padding: 16px;
`;

// Стили
const Container = styled.View`
  flex: 1;
  background: ${BG};
`;
const Title = styled.Text`
  font-size: 54px;
  font-weight: 900;
  color: #000;
  margin: 32px 0 0 16px;
  letter-spacing: 1px;
`;
const BlackLine = styled.View`
  height: 8px;
  background: #000;
  margin: 8px 0 0 0;
`;
const Section = styled.View`
  border: 4px solid ${BORDER};
  margin: 24px 16px 0 16px;
  padding: 12px 8px 20px 8px;
  background: ${BG};
`;
const SectionTitle = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: #000;
  margin-bottom: 12px;
  letter-spacing: 1px;
`;
const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
const StatBox = styled.View`
  width: 48%;
  background: ${GREY};
  border: 4px solid ${BORDER};
  margin-bottom: 12px;
  padding: 16px 0 12px 12px;
`;
const StatValue = styled.Text`
  font-size: 36px;
  font-weight: 900;
  color: #000;
`;
const StatLabel = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-top: 4px;
`;
const ProgressSection = styled.View`
  margin-top: 8px;
`;
const ProgressLabel = styled.Text`
  font-size: 18px;
  font-weight: 900;
  color: #000;
  margin-bottom: 6px;
`;
const ProgressBarBox = styled.View`
  border: 4px solid ${BORDER};
  background: #fff;
  padding: 8px 8px 8px 8px;
`;
const ProgressBar = styled.View`
  flex-direction: row;
  height: 38px;
  width: 100%;
  background: #fff;
`;
const ProgressFill = styled.View`
  background: ${ACCENT};
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;
const ProgressEmpty = styled.View`
  background: ${GREY};
  height: 100%;
`;
const ProgressText = styled.Text`
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  width: 100%;
  text-align: center;
`;
const CalendarGrid = styled.View`
  margin-top: 8px;
`;
const CalendarRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

interface CalendarCellProps {
  filled: boolean;
}

const CalendarCell = styled.View<CalendarCellProps>`
  width: 35px;
  height: 35px;
  margin: 4px;
  border: 2px solid ${BORDER};
  background-color: ${(props: CalendarCellProps) => (props.filled ? ACCENT : '#fff')};
`;
const AchievementsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;
const AchievementBox = styled.View`
  width: 48%;
  background: ${GREY};
  border: 4px solid ${BORDER};
  margin-bottom: 12px;
  padding: 16px 0 8px 0;
  align-items: center;
`;
const AchievementText = styled.Text`
  font-size: 18px;
  font-weight: 900;
  color: #000;
  text-align: center;
  margin-top: 8px;
`;
const WorkoutCard = styled.View`
  border: 4px solid ${BORDER};
  background: ${BG};
  margin-bottom: 16px;
  padding: 12px 12px 8px 12px;
`;
const WorkoutTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const WorkoutTitle = styled.Text`
  font-size: 22px;
  font-weight: 900;
  color: #000;
`;
const WorkoutTag = styled.Text`
  background: ${ACCENT};
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  padding: 2px 12px;
  margin-left: 8px;
`;
const WorkoutDesc = styled.Text`
  font-size: 16px;
  color: #222;
  margin-top: 4px;
`; 