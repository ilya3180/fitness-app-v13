import React from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Text } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const ACCENT = '#D13F32';
const BORDER = '#000';
const BG = '#fff';
const GREY = '#F3F4F6';

export default function ActivityScreen() {
  return (
    <Container>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Title>АКТИВНОСТЬ</Title>
        <BlackLine />
        <Section>
          <SectionTitle>СТАТИСТИКА</SectionTitle>
          <StatsRow>
            <StatBox>
              <StatValue>12</StatValue>
              <StatLabel>ТРЕНИРОВОК</StatLabel>
            </StatBox>
            <StatBox>
              <StatValue>6.5ч</StatValue>
              <StatLabel>ОБЩЕЕ ВРЕМЯ</StatLabel>
            </StatBox>
          </StatsRow>
          <ProgressSection>
            <ProgressLabel>ПРОГРЕСС К ЦЕЛИ</ProgressLabel>
            <ProgressBarBox>
              <ProgressBar>
                <ProgressFill style={{ width: '68%' }}>
                  <ProgressText>68%</ProgressText>
                </ProgressFill>
                <ProgressEmpty style={{ width: '32%' }} />
              </ProgressBar>
            </ProgressBarBox>
          </ProgressSection>
        </Section>
        <Section>
          <SectionTitle>РЕГУЛЯРНОСТЬ</SectionTitle>
          <CalendarGrid>
            {[...Array(5)].map((_, row) => (
              <CalendarRow key={row}>
                {[...Array(7)].map((_, col) => {
                  // Для примера: закрашиваем часть ячеек
                  const filled = (row === 0 && col === 1) || (row === 0 && col === 3) || (row === 1 && col === 0) || (row === 1 && col === 2) || (row === 2 && col === 1) || (row === 2 && col === 3) || (row === 3 && col === 0) || (row === 3 && col === 2) || (row === 4 && col === 1);
                  return <CalendarCell key={col} filled={filled} />;
                })}
              </CalendarRow>
            ))}
          </CalendarGrid>
        </Section>
        <Section>
          <SectionTitle>ДОСТИЖЕНИЯ</SectionTitle>
          <AchievementsGrid>
            <AchievementBox>
              <MaterialCommunityIcons name="medal-outline" size={36} color="#000" />
              <AchievementText>5 ТРЕНИРОВОК{"\n"}ПОДРЯД</AchievementText>
            </AchievementBox>
            <AchievementBox>
              <Feather name="clock" size={36} color="#000" />
              <AchievementText>10 ЧАСОВ{"\n"}ТРЕНИРОВОК</AchievementText>
            </AchievementBox>
            <AchievementBox>
              <FontAwesome5 name="chart-line" size={32} color="#000" />
              <AchievementText>+20% К ВЕСУ</AchievementText>
            </AchievementBox>
            <AchievementBox>
              <Feather name="calendar" size={36} color="#000" />
              <AchievementText>1 МЕСЯЦ{"\n"}С НАМИ</AchievementText>
            </AchievementBox>
          </AchievementsGrid>
        </Section>
        <Section>
          <SectionTitle>ИСТОРИЯ</SectionTitle>
          <WorkoutCard>
            <WorkoutTitleRow>
              <WorkoutTitle>СИЛОВАЯ ТРЕНИРОВКА</WorkoutTitle>
              <WorkoutTag>ВЧЕРА</WorkoutTag>
            </WorkoutTitleRow>
            <WorkoutDesc>Верхняя часть тела • 45 мин • 5 упражнений</WorkoutDesc>
          </WorkoutCard>
          <WorkoutCard>
            <WorkoutTitleRow>
              <WorkoutTitle>КАРДИО</WorkoutTitle>
              <WorkoutAgo>3 ДНЯ НАЗАД</WorkoutAgo>
            </WorkoutTitleRow>
            <WorkoutDesc>Интервальная • 30 мин • 320 ккал</WorkoutDesc>
          </WorkoutCard>
          <WorkoutCard>
            <WorkoutTitleRow>
              <WorkoutTitle>СИЛОВАЯ ТРЕНИРОВКА</WorkoutTitle>
              <WorkoutAgo>5 ДНЕЙ НАЗАД</WorkoutAgo>
            </WorkoutTitleRow>
            <WorkoutDesc>Нижняя часть тела • 50 мин • 6 упражнений</WorkoutDesc>
          </WorkoutCard>
        </Section>
      </ScrollView>
    </Container>
  );
}

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
  margin-bottom: 4px;
`;
const CalendarCell = styled.View<{ filled?: boolean }>`
  width: 36px;
  height: 36px;
  background: ${({ filled }) => (filled ? ACCENT : GREY)};
  border: 2.5px solid #000;
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