import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type GameSession = Database['public']['Tables']['game_sessions']['Row'];
type SessionParticipant = Database['public']['Tables']['session_participants']['Row'];
type PlayerDonation = Database['public']['Tables']['player_donations']['Row'];
type PlayerBudget = Database['public']['Tables']['player_budgets']['Row'];

export function useGameSession() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [donations, setDonations] = useState<PlayerDonation[]>([]);
  const [budgets, setBudgets] = useState<PlayerBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadGameSessionData();
    } else {
      setCurrentSession(null);
      setParticipants([]);
      setDonations([]);
      setBudgets([]);
      setLoading(false);
    }
  }, [user]);

  const loadGameSessionData = async () => {
    if (!user) return;

    try {
      setError(null);

      // Load current active session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .in('status', ['setup', 'donations', 'meeting', 'voting'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Error loading session:', sessionError);
        setError(sessionError.message);
        return;
      }

      if (sessionData) {
        setCurrentSession(sessionData);

        // Load participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('session_participants')
          .select('*')
          .eq('session_id', sessionData.id);

        if (participantsError) {
          console.error('Error loading participants:', participantsError);
          setError(participantsError.message);
        } else {
          setParticipants(participantsData || []);
        }

        // Load donations
        const { data: donationsData, error: donationsError } = await supabase
          .from('player_donations')
          .select('*')
          .eq('session_id', sessionData.id);

        if (donationsError) {
          console.error('Error loading donations:', donationsError);
          setError(donationsError.message);
        } else {
          setDonations(donationsData || []);
        }

        // Load budgets
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('player_budgets')
          .select('*')
          .eq('session_id', sessionData.id);

        if (budgetsError) {
          console.error('Error loading budgets:', budgetsError);
          setError(budgetsError.message);
        } else {
          setBudgets(budgetsData || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading game session data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createGameSession = async (name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          name,
          created_by: user.id,
          status: 'setup'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating game session:', error);
        setError(error.message);
        return null;
      }

      await loadGameSessionData();
      return data;
    } catch (error: any) {
      console.error('Error creating game session:', error);
      setError(error.message);
      return null;
    }
  };

  const joinSessionWithRandomRole = async (sessionId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('assign_random_role', {
        p_session_id: sessionId,
        p_player_id: user.id
      });

      if (error) {
        console.error('Error joining session:', error);
        setError(error.message);
        return null;
      }

      await loadGameSessionData();
      return data;
    } catch (error: any) {
      console.error('Error joining session:', error);
      setError(error.message);
      return null;
    }
  };

  const makeDonation = async (sessionId: string, amount: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('player_donations')
        .insert({
          session_id: sessionId,
          player_id: user.id,
          amount
        });

      if (error) {
        console.error('Error making donation:', error);
        setError(error.message);
        return false;
      }

      // Budgets will be recomputed automatically by trigger
      await loadGameSessionData();
      return true;
    } catch (error: any) {
      console.error('Error making donation:', error);
      setError(error.message);
      return false;
    }
  };

  const startDonationPhase = async (sessionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          status: 'donations',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error starting donation phase:', error);
        setError(error.message);
        return false;
      }

      await loadGameSessionData();
      return true;
    } catch (error: any) {
      console.error('Error starting donation phase:', error);
      setError(error.message);
      return false;
    }
  };

  const startMeeting = async (sessionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ 
          status: 'meeting',
          current_agenda_item: 'call_to_order'
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error starting meeting:', error);
        setError(error.message);
        return false;
      }

      await loadGameSessionData();
      return true;
    } catch (error: any) {
      console.error('Error starting meeting:', error);
      setError(error.message);
      return false;
    }
  };

  const advanceAgenda = async (sessionId: string, nextItem: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ current_agenda_item: nextItem })
        .eq('id', sessionId);

      if (error) {
        console.error('Error advancing agenda:', error);
        setError(error.message);
        return false;
      }

      await loadGameSessionData();
      return true;
    } catch (error: any) {
      console.error('Error advancing agenda:', error);
      setError(error.message);
      return false;
    }
  };

  const getUserParticipation = () => {
    if (!user || !currentSession) return null;
    return participants.find(p => p.player_id === user.id);
  };

  const getUserDonation = () => {
    if (!user || !currentSession) return null;
    return donations.find(d => d.player_id === user.id);
  };

  const getUserBudget = () => {
    if (!user || !currentSession) return null;
    return budgets.find(b => b.player_id === user.id);
  };

  return {
    currentSession,
    participants,
    donations,
    budgets,
    loading,
    error,
    createGameSession,
    joinSessionWithRandomRole,
    makeDonation,
    startDonationPhase,
    startMeeting,
    advanceAgenda,
    getUserParticipation,
    getUserDonation,
    getUserBudget,
    refreshData: loadGameSessionData
  };
}