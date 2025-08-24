import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type MeetingMinutesSummary = Database['public']['Tables']['meeting_minutes_summary']['Row'];
type FinancialSummary = Database['public']['Tables']['financial_summary']['Row'];
type Motion = Database['public']['Tables']['motions']['Row'];
type ScenarioQuestion = Database['public']['Tables']['scenario_questions']['Row'];
type ScenarioAnswer = Database['public']['Tables']['scenario_answers']['Row'];
type AnswerVote = Database['public']['Tables']['answer_votes']['Row'];
type NextAgenda = Database['public']['Tables']['next_agenda']['Row'];

export function useMeetingFlow() {
  const { user } = useAuth();
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutesSummary | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [motions, setMotions] = useState<Motion[]>([]);
  const [scenarioQuestions, setScenarioQuestions] = useState<ScenarioQuestion[]>([]);
  const [scenarioAnswers, setScenarioAnswers] = useState<ScenarioAnswer[]>([]);
  const [answerVotes, setAnswerVotes] = useState<AnswerVote[]>([]);
  const [nextAgenda, setNextAgenda] = useState<NextAgenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetingData = async (sessionId: string) => {
    if (!user) return;

    try {
      setError(null);

      // Load meeting minutes
      const { data: minutesData, error: minutesError } = await supabase
        .from('meeting_minutes_summary')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (minutesError && minutesError.code !== 'PGRST116') {
        console.error('Error loading minutes:', minutesError);
        setError(minutesError.message);
      } else {
        setMeetingMinutes(minutesData);
      }

      // Load financial summary
      const { data: financialData, error: financialError } = await supabase
        .from('financial_summary')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (financialError && financialError.code !== 'PGRST116') {
        console.error('Error loading financial summary:', financialError);
        setError(financialError.message);
      } else {
        setFinancialSummary(financialData);
      }

      // Load motions
      const { data: motionsData, error: motionsError } = await supabase
        .from('motions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (motionsError) {
        console.error('Error loading motions:', motionsError);
        setError(motionsError.message);
      } else {
        setMotions(motionsData || []);
      }

      // Load scenario questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('scenario_questions')
        .select('*');

      if (questionsError) {
        console.error('Error loading scenario questions:', questionsError);
        setError(questionsError.message);
      } else {
        setScenarioQuestions(questionsData || []);
      }

      // Load scenario answers
      const { data: answersData, error: answersError } = await supabase
        .from('scenario_answers')
        .select('*')
        .eq('session_id', sessionId);

      if (answersError) {
        console.error('Error loading scenario answers:', answersError);
        setError(answersError.message);
      } else {
        setScenarioAnswers(answersData || []);
      }

      // Load answer votes
      const { data: votesData, error: votesError } = await supabase
        .from('answer_votes')
        .select('*');

      if (votesError) {
        console.error('Error loading answer votes:', votesError);
        setError(votesError.message);
      } else {
        setAnswerVotes(votesData || []);
      }

      // Load next agenda
      const { data: agendaData, error: agendaError } = await supabase
        .from('next_agenda')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (agendaError && agendaError.code !== 'PGRST116') {
        console.error('Error loading next agenda:', agendaError);
        setError(agendaError.message);
      } else {
        setNextAgenda(agendaData);
      }

    } catch (error: any) {
      console.error('Error loading meeting data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Secretary functions
  const submitMinutes = async (sessionId: string, previousMinutes: string, currentMinutes: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('meeting_minutes_summary')
        .upsert({
          session_id: sessionId,
          secretary_id: user.id,
          previous_minutes: previousMinutes,
          current_minutes: currentMinutes
        });

      if (error) {
        console.error('Error submitting minutes:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error submitting minutes:', error);
      setError(error.message);
      return false;
    }
  };

  const voteOnMinutes = async (sessionId: string, vote: 'approve' | 'reject' | 'amend') => {
    if (!user || !meetingMinutes) return false;

    try {
      const currentVotes = meetingMinutes.approval_votes || {};
      currentVotes[user.id] = vote;

      const { error } = await supabase
        .from('meeting_minutes_summary')
        .update({ approval_votes: currentVotes })
        .eq('id', meetingMinutes.id);

      if (error) {
        console.error('Error voting on minutes:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error voting on minutes:', error);
      setError(error.message);
      return false;
    }
  };

  // Treasurer functions
  const submitFinancialSummary = async (sessionId: string, totalDonations: number, prizePool: number, budgetPerPlayer: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('financial_summary')
        .upsert({
          session_id: sessionId,
          treasurer_id: user.id,
          total_donations: totalDonations,
          prize_pool: prizePool,
          budget_per_player: budgetPerPlayer
        });

      if (error) {
        console.error('Error submitting financial summary:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error submitting financial summary:', error);
      setError(error.message);
      return false;
    }
  };

  const challengeBudget = async (sessionId: string, challenge: string) => {
    if (!user || !financialSummary) return false;

    try {
      const currentChallenges = financialSummary.budget_challenges || [];
      currentChallenges.push({
        player_id: user.id,
        challenge: challenge,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase
        .from('financial_summary')
        .update({ budget_challenges: currentChallenges })
        .eq('id', financialSummary.id);

      if (error) {
        console.error('Error challenging budget:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error challenging budget:', error);
      setError(error.message);
      return false;
    }
  };

  // Motion functions
  const proposeMotion = async (sessionId: string, title: string, description: string, motionType: 'old_business' | 'new_business') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('motions')
        .insert({
          session_id: sessionId,
          proposed_by: user.id,
          title,
          description,
          motion_type: motionType
        });

      if (error) {
        console.error('Error proposing motion:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error proposing motion:', error);
      setError(error.message);
      return false;
    }
  };

  const voteOnMotion = async (motionId: string, vote: 'approve' | 'reject' | 'abstain') => {
    if (!user) return false;

    try {
      const motion = motions.find(m => m.id === motionId);
      if (!motion) return false;

      const currentVotes = motion.votes || {};
      currentVotes[user.id] = vote;

      const { error } = await supabase
        .from('motions')
        .update({ votes: currentVotes })
        .eq('id', motionId);

      if (error) {
        console.error('Error voting on motion:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(motion.session_id);
      return true;
    } catch (error: any) {
      console.error('Error voting on motion:', error);
      setError(error.message);
      return false;
    }
  };

  // Scenario functions
  const submitScenarioAnswer = async (sessionId: string, questionId: string, answerText: string, budgetUsed: number = 0) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('scenario_answers')
        .insert({
          session_id: sessionId,
          player_id: user.id,
          question_id: questionId,
          answer_text: answerText,
          budget_used: budgetUsed
        });

      if (error) {
        console.error('Error submitting scenario answer:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error submitting scenario answer:', error);
      setError(error.message);
      return false;
    }
  };

  const voteOnAnswer = async (answerId: string, coinsAwarded: number, feedback?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('answer_votes')
        .insert({
          answer_id: answerId,
          voter_id: user.id,
          coins_awarded: coinsAwarded,
          feedback
        });

      if (error) {
        console.error('Error voting on answer:', error);
        setError(error.message);
        return false;
      }

      // Reload data to get updated votes
      const answer = scenarioAnswers.find(a => a.id === answerId);
      if (answer) {
        await loadMeetingData(answer.session_id);
      }
      return true;
    } catch (error: any) {
      console.error('Error voting on answer:', error);
      setError(error.message);
      return false;
    }
  };

  // Next agenda functions
  const updateNextAgenda = async (sessionId: string, agendaItems: string[]) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('next_agenda')
        .upsert({
          session_id: sessionId,
          agenda_items: agendaItems,
          updated_by: user.id
        });

      if (error) {
        console.error('Error updating next agenda:', error);
        setError(error.message);
        return false;
      }

      await loadMeetingData(sessionId);
      return true;
    } catch (error: any) {
      console.error('Error updating next agenda:', error);
      setError(error.message);
      return false;
    }
  };

  const getQuestionsForRole = (roleName: string) => {
    return scenarioQuestions.filter(q => q.role_name === roleName);
  };

  const getUserAnswer = (questionId: string) => {
    if (!user) return null;
    return scenarioAnswers.find(a => a.player_id === user.id && a.question_id === questionId);
  };

  const getAnswersForVoting = () => {
    if (!user) return [];
    // Return answers that user hasn't voted on yet (excluding their own)
    return scenarioAnswers.filter(answer => 
      answer.player_id !== user.id && 
      !answerVotes.some(vote => vote.answer_id === answer.id && vote.voter_id === user.id)
    );
  };

  return {
    meetingMinutes,
    financialSummary,
    motions,
    scenarioQuestions,
    scenarioAnswers,
    answerVotes,
    nextAgenda,
    loading,
    error,
    loadMeetingData,
    submitMinutes,
    voteOnMinutes,
    submitFinancialSummary,
    challengeBudget,
    proposeMotion,
    voteOnMotion,
    submitScenarioAnswer,
    voteOnAnswer,
    updateNextAgenda,
    getQuestionsForRole,
    getUserAnswer,
    getAnswersForVoting
  };
}