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
          name: string | null;
          email: string | null;
          total_coins: number;
          games_played: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          total_coins?: number;
          games_played?: number;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          total_coins?: number;
          games_played?: number;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          name: string;
          status: 'setup' | 'donations' | 'meeting' | 'voting' | 'completed';
          current_agenda_item: string;
          total_donations: number;
          prize_pool: number;
          created_by: string | null;
          created_at: string;
          started_at: string | null;
          ended_at: string | null;
        };
        Insert: {
          name: string;
          status?: 'setup' | 'donations' | 'meeting' | 'voting' | 'completed';
          current_agenda_item?: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          status?: 'setup' | 'donations' | 'meeting' | 'voting' | 'completed';
          current_agenda_item?: string;
          started_at?: string | null;
          ended_at?: string | null;
        };
      };
      session_participants: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          role_name: string;
          joined_at: string;
        };
        Insert: {
          session_id: string;
          player_id: string;
          role_name: string;
        };
        Update: {
          role_name?: string;
        };
      };
      player_donations: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          amount: number;
          donated_at: string;
        };
        Insert: {
          session_id: string;
          player_id: string;
          amount: number;
        };
        Update: {
          amount?: number;
        };
      };
      player_budgets: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          allocated_amount: number;
          spent_amount: number;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          player_id: string;
          allocated_amount?: number;
          spent_amount?: number;
        };
        Update: {
          allocated_amount?: number;
          spent_amount?: number;
        };
      };
      meeting_minutes_summary: {
        Row: {
          id: string;
          session_id: string;
          secretary_id: string;
          previous_minutes: string | null;
          current_minutes: string | null;
          minutes_approved: boolean;
          approval_votes: Record<string, any>;
          created_at: string;
        };
        Insert: {
          session_id: string;
          secretary_id: string;
          previous_minutes?: string | null;
          current_minutes?: string | null;
          minutes_approved?: boolean;
          approval_votes?: Record<string, any>;
        };
        Update: {
          previous_minutes?: string | null;
          current_minutes?: string | null;
          minutes_approved?: boolean;
          approval_votes?: Record<string, any>;
        };
      };
      financial_summary: {
        Row: {
          id: string;
          session_id: string;
          treasurer_id: string;
          total_donations: number;
          prize_pool: number;
          budget_per_player: number;
          budget_approved: boolean;
          budget_challenges: any[];
          created_at: string;
        };
        Insert: {
          session_id: string;
          treasurer_id: string;
          total_donations?: number;
          prize_pool?: number;
          budget_per_player?: number;
          budget_approved?: boolean;
          budget_challenges?: any[];
        };
        Update: {
          total_donations?: number;
          prize_pool?: number;
          budget_per_player?: number;
          budget_approved?: boolean;
          budget_challenges?: any[];
        };
      };
      motions: {
        Row: {
          id: string;
          session_id: string;
          proposed_by: string;
          title: string;
          description: string;
          motion_type: 'old_business' | 'new_business';
          status: 'proposed' | 'voting' | 'approved' | 'rejected' | 'tabled';
          votes: Record<string, any>;
          created_at: string;
        };
        Insert: {
          session_id: string;
          proposed_by: string;
          title: string;
          description: string;
          motion_type?: 'old_business' | 'new_business';
          status?: 'proposed' | 'voting' | 'approved' | 'rejected' | 'tabled';
          votes?: Record<string, any>;
        };
        Update: {
          title?: string;
          description?: string;
          motion_type?: 'old_business' | 'new_business';
          status?: 'proposed' | 'voting' | 'approved' | 'rejected' | 'tabled';
          votes?: Record<string, any>;
        };
      };
      scenario_questions: {
        Row: {
          id: string;
          role_name: string;
          question_text: string;
          question_type: 'multiple_choice' | 'open_ended' | 'budget_allocation';
          options: any[];
          points_possible: number;
          created_at: string;
        };
        Insert: {
          role_name: string;
          question_text: string;
          question_type?: 'multiple_choice' | 'open_ended' | 'budget_allocation';
          options?: any[];
          points_possible?: number;
        };
        Update: {
          role_name?: string;
          question_text?: string;
          question_type?: 'multiple_choice' | 'open_ended' | 'budget_allocation';
          options?: any[];
          points_possible?: number;
        };
      };
      scenario_answers: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          question_id: string;
          answer_text: string;
          budget_used: number;
          submitted_at: string;
        };
        Insert: {
          session_id: string;
          player_id: string;
          question_id: string;
          answer_text: string;
          budget_used?: number;
        };
        Update: {
          answer_text?: string;
          budget_used?: number;
        };
      };
      answer_votes: {
        Row: {
          id: string;
          answer_id: string;
          voter_id: string;
          coins_awarded: number;
          feedback: string | null;
          voted_at: string;
        };
        Insert: {
          answer_id: string;
          voter_id: string;
          coins_awarded: number;
          feedback?: string | null;
        };
        Update: {
          coins_awarded?: number;
          feedback?: string | null;
        };
      };
      next_agenda: {
        Row: {
          id: string;
          session_id: string;
          agenda_items: string[];
          updated_by: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          agenda_items?: string[];
          updated_by: string;
        };
        Update: {
          agenda_items?: string[];
          updated_by?: string;
        };
      };
    };
    Functions: {
      assign_random_role: {
        Args: {
          p_session_id: string;
          p_player_id: string;
        };
        Returns: string;
      };
      recompute_budgets: {
        Args: {
          p_session_id: string;
        };
        Returns: void;
      };
    };
  };
};