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
      'player badges': {
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
    game_sessions: {
      Row: {
        id: string;
        name: string;
        status: 'setup' | 'donations' | 'meeting' | 'completed';
        total_donations: number;
        prize_pool: number;
        created_by: string;
        created_at: string;
        started_at: string | null;
        ended_at: string | null;
      };
      Insert: {
        name: string;
        created_by: string;
        status?: 'setup' | 'donations' | 'meeting' | 'completed';
        total_donations?: number;
        prize_pool?: number;
      };
      Update: {
        name?: string;
        status?: 'setup' | 'donations' | 'meeting' | 'completed';
        total_donations?: number;
        prize_pool?: number;
        started_at?: string | null;
        ended_at?: string | null;
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
    role_budgets: {
      Row: {
        id: string;
        session_id: string;
        role_id: string;
        allocated_budget: number;
        spent_budget: number;
      };
      Insert: {
        session_id: string;
        role_id: string;
        allocated_budget?: number;
        spent_budget?: number;
      };
      Update: {
        allocated_budget?: number;
        spent_budget?: number;
      };
    };
    meeting_sessions: {
      Row: {
        id: string;
        game_session_id: string;
        current_agenda_item: number;
        meeting_minutes: Record<string, any>;
        status: 'call_to_order' | 'minutes_review' | 'reports' | 'old_business' | 'new_business' | 'adjournment';
        created_at: string;
      };
      Insert: {
        game_session_id: string;
        current_agenda_item?: number;
        meeting_minutes?: Record<string, any>;
        status?: 'call_to_order' | 'minutes_review' | 'reports' | 'old_business' | 'new_business' | 'adjournment';
      };
      Update: {
        current_agenda_item?: number;
        meeting_minutes?: Record<string, any>;
        status?: 'call_to_order' | 'minutes_review' | 'reports' | 'old_business' | 'new_business' | 'adjournment';
      };
    };
    meeting_responses: {
      Row: {
        id: string;
        meeting_session_id: string;
        player_id: string;
        agenda_item: string;
        responses: Record<string, any>;
        points_earned: number;
        submitted_at: string;
      };
      Insert: {
        meeting_session_id: string;
        player_id: string;
        agenda_item: string;
        responses?: Record<string, any>;
        points_earned?: number;
      };
      Update: {
        responses?: Record<string, any>;
        points_earned?: number;
      };
    };
    session_participants: {
      Row: {
        id: string;
        session_id: string;
        player_id: string;
        role_id: string;
        joined_at: string;
      };
      Insert: {
        session_id: string;
        player_id: string;
        role_id: string;
      };
      Update: {
        role_id?: string;
      };
    };
  };
};