import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type GameSession = Database['public']['Tables']['game_sessions']['Row'];
type PlayerDonation = Database['public']['Tables']['player_donations']['Row'];
type RoleBudget = Database['public']['Tables']['role_budgets']['Row'];
type SessionParticipant = Database['public']['Tables']['session_participants']['Row'];

export function useGameSession() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [donations, setDonations] = useState<PlayerDonation[]>([]);
  const [roleBudgets, setRoleBudgets] = useState<RoleBudget[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGameSessionData();
    } else {
      setCurrentSession(null);
      setDonations([]);
      setRoleBudgets([]);
      setParticipants([]);
      setLoading(false);
    }
  }, [user]);

  const loadGameSessionData = async () => {
    if (!user) return;

    try {
      // Load current active session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .in('status', ['setup', 'donations', 'meeting'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Error loading session:', sessionError);
        return;
      }

      if (sessionData) {
        setCurrentSession(sessionData);

        // Load donations for this session
        const { data: donationsData, error: donationsError } = await supabase
          .from('player_donations')
          .select('*')
          .eq('session_id', sessionData.id);

        if (donationsError) {
          console.error('Error loading donations:', donationsError);
        } else {
          setDonations(donationsData || []);
        }

        // Load role budgets
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('role_budgets')
          .select('*')
          .eq('session_id', sessionData.id);

        if (budgetsError) {
          console.error('Error loading budgets:', budgetsError);
        } else {
          setRoleBudgets(budgetsData || []);
        }

        // Load participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('session_participants')
          .select('*')
          .eq('session_id', sessionData.id);

        if (participantsError) {
          console.error('Error loading participants:', participantsError);
        } else {
          setParticipants(participantsData || []);
        }
      }
    } catch (error) {
      console.error('Error loading game session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGameSession = async (name: string) => {
    if (!user) return null;

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
      return null;
    }

    await loadGameSessionData();
    return data;
  };

  const joinSession = async (sessionId: string, roleId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        player_id: user.id,
        role_id: roleId
      });

    if (error) {
      console.error('Error joining session:', error);
      return false;
    }

    await loadGameSessionData();
    return true;
  };

  const makeDonation = async (sessionId: string, amount: number) => {
    if (!user) return false;

    const { error } = await supabase
      .from('player_donations')
      .insert({
        session_id: sessionId,
        player_id: user.id,
        amount
      });

    if (error) {
      console.error('Error making donation:', error);
      return false;
    }

    // Update session totals
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0) + amount;
    const prizePool = totalDonations * 0.5;
    const operatingBudget = totalDonations - prizePool;

    await supabase
      .from('game_sessions')
      .update({
        total_donations: totalDonations,
        prize_pool: prizePool
      })
      .eq('id', sessionId);

    // Distribute budget among roles (assuming 9 roles)
    const budgetPerRole = operatingBudget / 9;
    const roleIds = [
      'executive-director', 'treasurer', 'secretary', 'program-director',
      'project-director', 'fundraising-director', 'grant-writer',
      'marketing-communications', 'app-developer'
    ];

    for (const roleId of roleIds) {
      await supabase
        .from('role_budgets')
        .upsert({
          session_id: sessionId,
          role_id: roleId,
          allocated_budget: budgetPerRole
        });
    }

    await loadGameSessionData();
    return true;
  };

  const startDonationPhase = async (sessionId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('game_sessions')
      .update({
        status: 'donations',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error starting donation phase:', error);
      return false;
    }

    await loadGameSessionData();
    return true;
  };

  const startMeeting = async (sessionId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('game_sessions')
      .update({ status: 'meeting' })
      .eq('id', sessionId);

    if (error) {
      console.error('Error starting meeting:', error);
      return false;
    }

    await loadGameSessionData();
    return true;
  };

  const getUserDonation = () => {
    if (!user || !currentSession) return null;
    return donations.find(d => d.player_id === user.id);
  };

  const getUserParticipation = () => {
    if (!user || !currentSession) return null;
    return participants.find(p => p.player_id === user.id);
  };

  const getRoleBudget = (roleId: string) => {
    return roleBudgets.find(b => b.role_id === roleId);
  };

  return {
    currentSession,
    donations,
    roleBudgets,
    participants,
    loading,
    createGameSession,
    joinSession,
    makeDonation,
    startDonationPhase,
    startMeeting,
    getUserDonation,
    getUserParticipation,
    getRoleBudget,
    refreshData: loadGameSessionData
  };
}