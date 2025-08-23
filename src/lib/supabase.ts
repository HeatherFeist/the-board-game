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
          auth_id: string;
          name: string;
          role: string | null;
          score: number;
          progress: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          auth_id: string;
          name: string;
          role?: string | null;
          score?: number;
          progress?: Record<string, any>;
        };
        Update: {
          name?: string;
          role?: string | null;
          score?: number;
          progress?: Record<string, any>;
        };
      };
      player_badges: {
        Row: {
          id: string;
          player_id: string;
          badge: string;
          awarded_at: string;
        };
        Insert: {
          player_id: string;
          badge: string;
        };
        Update: {
          badge?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          role: string;
          question: string;
          options: Record<string, any>;
          correct_answer: string | null;
          meeting_id: string | null;
          created_at: string;
        };
        Insert: {
          role: string;
          question: string;
          options: Record<string, any>;
          correct_answer?: string | null;
          meeting_id?: string | null;
        };
        Update: {
          role?: string;
          question?: string;
          options?: Record<string, any>;
          correct_answer?: string | null;
          meeting_id?: string | null;
        };
      };
      scenario_responses: {
        Row: {
          id: string;
          player_id: string;
          scenario_id: string;
          answer: string;
          score: number;
          created_at: string;
        };
        Insert: {
          player_id: string;
          scenario_id: string;
          answer: string;
          score?: number;
        };
        Update: {
          answer?: string;
          score?: number;
        };
      };
      peer_votes: {
        Row: {
          id: string;
          voter_id: string;
          response_id: string;
          score: number;
          created_at: string;
        };
        Insert: {
          voter_id: string;
          response_id: string;
          score: number;
        };
        Update: {
          score?: number;
        };
      };
      meetings: {
        Row: {
          id: string;
          title: string;
          agenda: Record<string, any>;
          minutes: Record<string, any>;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          agenda?: Record<string, any>;
          minutes?: Record<string, any>;
          status?: string;
        };
        Update: {
          title?: string;
          agenda?: Record<string, any>;
          minutes?: Record<string, any>;
          status?: string;
        };
      };
      meeting_reflections: {
        Row: {
          id: string;
          player_id: string;
          meeting_id: string;
          reflection_text: string;
          created_at: string;
        };
        Insert: {
          player_id: string;
          meeting_id: string;
          reflection_text: string;
        };
        Update: {
          reflection_text?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          player_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          player_id: string;
          amount: number;
        };
        Update: {
          amount?: number;
        };
      };
      budgets: {
        Row: {
          id: string;
          category: string;
          amount: number;
          meeting_id: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          amount?: number;
          meeting_id?: string | null;
        };
        Update: {
          category?: string;
          amount?: number;
          meeting_id?: string | null;
        };
      };
      prize_pool: {
        Row: {
          id: string;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          total_amount?: number;
        };
        Update: {
          total_amount?: number;
        };
      };
    };
  };
};