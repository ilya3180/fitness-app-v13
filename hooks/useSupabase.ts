import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

/**
 * Хук для использования Supabase аутентификации
 * @returns Объект с данными пользователя, статусом загрузки и функциями для работы с аутентификацией
 */
export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Подписываемся на изменения в аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Функция для входа по email/пароль
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  // Функция для регистрации по email/пароль
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    return { error };
  };

  // Функция для выхода из аккаунта
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

/**
 * Хук для получения данных из таблицы Supabase
 * @param tableName Название таблицы
 * @param options Опции запроса
 * @returns Данные, статус загрузки и функцию обновления
 */
export function useSupabaseQuery<T = any>(
  tableName: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    dependencies?: any[];
  }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { select = '*', filter, order, limit, dependencies = [] } = options || {};

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from(tableName).select(select);

      // Применяем фильтры, если они есть
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Применяем сортировку, если она есть
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      // Применяем лимит, если он есть
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setData(data as T[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
} 