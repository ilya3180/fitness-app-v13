import React, { useCallback } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useHomeData } from '@/hooks/useHomeData';
import { formatTime, formatWorkoutDate } from '@/lib/supabase/api';

const ACCENT = '#D13F32';
const BORDER = '#000';
const BG = '#fff';
const GREY = '#F3F4F6';

export default function HomeScreen() {
  const { stats, workouts, loading, refetch } = useHomeData();
  const [refreshing, setRefreshing] = React.useState(false);

  // Обновляем данные при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Обработчик pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  
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
        <LogoBlock>
          <LogoRow>
            <LogoText>FIT</LogoText>
            <BrutalBox>
              <BrutalText>BRUTAL</BrutalText>
            </BrutalBox>
          </LogoRow>
          <Slogan>NO PAIN.  NO GAIN.</Slogan>
        </LogoBlock>
        <RedLine />
        <Section>
          <SectionTitle>СТАТИСТИКА</SectionTitle>
          <StatsGrid>
            <StatBox>
              <StatValue>{stats?.workouts || 0}</StatValue>
              <StatLabel>ТРЕНИРОВОК</StatLabel>
            </StatBox>
            <StatBox>
              <StatValue>{stats ? formatTime(stats.total_time) : '0ч'}</StatValue>
              <StatLabel>ОБЩЕЕ ВРЕМЯ</StatLabel>
            </StatBox>
            <StatBox>
              <StatValue>{stats ? `${Math.round(stats.progress)}%` : '0%'}</StatValue>
              <StatLabel>ПРОГРЕСС</StatLabel>
            </StatBox>
            <StatBox>
              <StatValue>{stats?.badges || 0}</StatValue>
              <StatLabel>БЕЙДЖИ</StatLabel>
            </StatBox>
          </StatsGrid>
        </Section>
        <Section>
          <SectionTitle>ТРЕНИРОВКИ</SectionTitle>
          {loading && !refreshing ? (
            <LoadingMessage>ЗАГРУЗКА...</LoadingMessage>
          ) : workouts.length === 0 ? (
            <EmptyMessage>У ВАС ЕЩЕ НЕТ ТРЕНИРОВОК</EmptyMessage>
          ) : (
            <WorkoutList>
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id}>
                  <WorkoutTitleRow>
                    <WorkoutTitle>{workout.type.toUpperCase()}</WorkoutTitle>
                    <WorkoutTag>{formatWorkoutDate(workout.date)}</WorkoutTag>
                  </WorkoutTitleRow>
                  <WorkoutDesc>{workout.duration} минут</WorkoutDesc>
                </WorkoutCard>
              ))}
            </WorkoutList>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

// Контейнеры и стили
const Container = styled.View`
  flex: 1;
  background: ${BG};
`;
const LogoBlock = styled.View`
  margin-top: 36px;
  align-items: center;
`;
const LogoRow = styled.View`
  flex-direction: row;
  align-items: center;
`;
const LogoText = styled.Text`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #000;
`;
const BrutalBox = styled.View`
  background: ${ACCENT};
  padding: 0 12px;
  margin-left: 8px;
  border-radius: 0px;
  justify-content: center;
  align-items: center;
  height: 54px;
`;
const BrutalText = styled.Text`
  color: #fff;
  font-size: 44px;
  font-weight: 900;
  letter-spacing: 2px;
`;
const Slogan = styled.Text`
  margin-top: 8px;
  font-size: 20px;
  font-family: monospace;
  color: #fff;
  background: #000;
  padding: 4px 24px;
  letter-spacing: 2px;
`;
const RedLine = styled.View`
  height: 8px;
  background: ${ACCENT};
  margin: 12px 0 0 0;
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
const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
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
const WorkoutList = styled.View``;
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
const WorkoutAgo = styled.Text`
  color: #000;
  font-size: 18px;
  font-weight: 900;
`;
const WorkoutDesc = styled.Text`
  font-size: 16px;
  color: #222;
  margin-top: 4px;
`;
const LoadingMessage = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin: 20px 0;
`;
const EmptyMessage = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin: 20px 0;
`;
