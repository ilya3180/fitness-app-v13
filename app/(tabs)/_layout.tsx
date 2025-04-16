import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

type IconType = 'MaterialCommunityIcons' | 'Ionicons' | 'FontAwesome5';

const TabBarIcon = ({ 
  name, 
  color,
  size = 24, 
  type = 'MaterialCommunityIcons'
}: { 
  name: string; 
  color: string; 
  size?: number;
  type?: IconType;
}) => {
  switch(type) {
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={name as any} size={size} color={color} />;
    default:
      return null;
  }
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = '';
        let iconType: IconType = 'FontAwesome5';
        
        if (route.name === 'index') {
          iconName = 'home';
          iconType = 'FontAwesome5';
        } else if (route.name === 'activity') {
          iconName = 'stats-chart';
          iconType = 'Ionicons';
        } else if (route.name === 'explore') {
          iconName = 'dumbbell';
          iconType = 'FontAwesome5';
        }

        return (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.tabItem, 
              isFocused && styles.activeTabItem
            ]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <TabBarIcon 
              name={iconName} 
              type={iconType} 
              color={isFocused ? '#fff' : '#000'} 
            />
            <Text style={[
              styles.tabLabel, 
              isFocused && styles.activeTabLabel,
              { fontFamily: 'IBMPlexMono-Bold' }
            ]}>
              {label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Активность',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Тренировка',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderTopColor: '#000',
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  activeTabItem: {
    backgroundColor: '#D32F2F',
  },
  tabLabel: {
    fontSize: 12, // text-xs (0.75rem)
    marginTop: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeTabLabel: {
    color: '#FFF',
  },
});
