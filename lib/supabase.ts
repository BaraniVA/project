import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      screen_time_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          app_name: string;
          hours: number;
          est_value_lost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          app_name: string;
          hours: number;
          est_value_lost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          app_name?: string;
          hours?: number;
          est_value_lost?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cost: number;
          usage_hours: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cost: number;
          usage_hours: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cost?: number;
          usage_hours?: number;
          created_at?: string;
        };
      };
      distraction_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          pickup_count: number;
          notification_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          pickup_count: number;
          notification_count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          pickup_count?: number;
          notification_count?: number;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_amount: number;
          current_saved: number;
          estimated_days_delayed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target_amount: number;
          current_saved?: number;
          estimated_days_delayed?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          target_amount?: number;
          current_saved?: number;
          estimated_days_delayed?: number;
          created_at?: string;
        };
      };
      focus_activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          hours: number;
          points: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          hours: number;
          points: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          hours?: number;
          points?: number;
          date?: string;
          created_at?: string;
        };
      };
      attention_wallet: {
        Row: {
          id: string;
          user_id: string;
          total_saved_time: number;
          total_points: number;
          money_saved: number;
          streak_days: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_saved_time?: number;
          total_points?: number;
          money_saved?: number;
          streak_days?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_saved_time?: number;
          total_points?: number;
          money_saved?: number;
          streak_days?: number;
          updated_at?: string;
        };
      };
    };
  };
};