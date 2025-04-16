import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { nanoid } from 'nanoid';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Получение переменных окружения из Expo Constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string || '';
const supabaseServiceRoleKey = Constants.expoConfig?.extra?.supabaseServiceRoleKey as string || '';

// Проверка наличия обязательных переменных окружения
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error(
    'Ошибка: не указаны EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY или EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY в .env файле или app.config.js'
  );
}

// Создание клиента Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Создание административного клиента Supabase с service role key для админских операций
export const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Типизированные методы для более удобной работы с Supabase
export const auth = supabase.auth;
export const db = supabase.from;
export const storage = supabase.storage;

// Вспомогательные функции для работы с auth
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Вспомогательная функция для генерации уникального ID
export const generateUniqueId = () => {
  return nanoid();
};

// Функция для обновления профиля пользователя
export const updateUserProfile = async (profileData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', profileData.id)
    .select();
  
  if (error) throw error;
  return data;
};

// Функция для получения тренировок пользователя
export const getUserWorkouts = async (userId: string) => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Функция для создания новой тренировки
export const createWorkout = async (workoutData: any) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workoutData)
    .select();
  
  if (error) throw error;
  return data;
};

// Функция для получения упражнений
export const getExercises = async () => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Функция для получения тренировочных программ
export const getWorkoutPlans = async () => {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Административная функция для создания нового упражнения (требует service role)
export const adminCreateExercise = async (exerciseData: any) => {
  const { data, error } = await adminSupabase
    .from('exercises')
    .insert(exerciseData)
    .select();
  
  if (error) throw error;
  return data;
};

// Административная функция для создания тренировочной программы
export const adminCreateWorkoutPlan = async (planData: any) => {
  const { data, error } = await adminSupabase
    .from('workout_plans')
    .insert(planData)
    .select();
  
  if (error) throw error;
  return data;
}; 