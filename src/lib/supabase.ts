import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          current_role: string | null;
          level: number;
          experience: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          current_role?: string | null;
          level?: number;
          experience?: number;
        };
        Update: {
          name?: string;
          current_role?: string | null;
          level?: number;
          experience?: number;
        };
      };
      player_badges: {
        Row: {
          id: string;
          player_id: string;
          badge_name: string;
          earned_at: string;
        };
        Insert: {
          player_id: string;
          badge_name: string;
        };
        Update: {
          badge_name?: string;
        };
      };
      completed_scenarios: {
        Row: {
          id: string;
          player_id: string;
          scenario_id: string;
          role_id: string;
          score: number | null;
          completed_at: string;
        };
        Insert: {
          player_id: string;
          scenario_id: string;
          role_id: string;
          score?: number | null;
        };
        Update: {
          score?: number | null;
        };
      };
      scenario_progress: {
        Row: {
          id: string;
          player_id: string;
          scenario_id: string;
          role_id: string;
          current_step: number;
          decisions_made: Record<string, any>;
          started_at: string;
          updated_at: string;
        };
        Insert: {
          player_id: string;
          scenario_id: string;
          role_id: string;
          current_step?: number;
          decisions_made?: Record<string, any>;
        };
        Update: {
          current_step?: number;
          decisions_made?: Record<string, any>;
        };
      };
    };
  };
};