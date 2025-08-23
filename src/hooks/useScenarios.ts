import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';
import { usePlayer } from './usePlayer';

type Scenario = Database['public']['Tables']['scenarios']['Row'];
type ScenarioResponse = Database['public']['Tables']['scenario_responses']['Row'];
type PeerVote = Database['public']['Tables']['peer_votes']['Row'];

export function useScenarios() {
  const { user } = useAuth();
  const { player } = usePlayer();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [responses, setResponses] = useState<ScenarioResponse[]>([]);
  const [votes, setVotes] = useState<PeerVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && player) {
      loadScenarioData();
    } else {
      setScenarios([]);
      setResponses([]);
      setVotes([]);
      setLoading(false);
    }
  }, [user, player]);

  const loadScenarioData = async () => {
    if (!user || !player) return;

    try {
      setError(null);

      // Load scenarios for player's role
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('scenarios')
        .select('*')
        .eq('role', player.role || '');

      if (scenariosError) {
        console.error('Error loading scenarios:', scenariosError);
        setError(scenariosError.message);
      } else {
        setScenarios(scenariosData || []);
      }

      // Load all responses for peer voting
      const { data: responsesData, error: responsesError } = await supabase
        .from('scenario_responses')
        .select('*, players(name)');

      if (responsesError) {
        console.error('Error loading responses:', responsesError);
        setError(responsesError.message);
      } else {
        setResponses(responsesData || []);
      }

      // Load user's votes
      const { data: votesData, error: votesError } = await supabase
        .from('peer_votes')
        .select('*')
        .eq('voter_id', player.id);

      if (votesError) {
        console.error('Error loading votes:', votesError);
        setError(votesError.message);
      } else {
        setVotes(votesData || []);
      }
    } catch (error: any) {
      console.error('Error loading scenario data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (scenarioId: string, answer: string) => {
    if (!user || !player) return null;

    try {
      const { data, error } = await supabase
        .from('scenario_responses')
        .insert({
          player_id: player.id,
          scenario_id: scenarioId,
          answer,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting response:', error);
        setError(error.message);
        return null;
      }

      await loadScenarioData();
      return data;
    } catch (error: any) {
      console.error('Error submitting response:', error);
      setError(error.message);
      return null;
    }
  };

  const submitVote = async (responseId: string, score: number) => {
    if (!user || !player) return;

    try {
      const { error } = await supabase
        .from('peer_votes')
        .upsert({
          voter_id: player.id,
          response_id: responseId,
          score,
        });

      if (error) {
        console.error('Error submitting vote:', error);
        setError(error.message);
        return;
      }

      // Recalculate response score
      await recalculateResponseScore(responseId);
      await loadScenarioData();
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      setError(error.message);
    }
  };

  const recalculateResponseScore = async (responseId: string) => {
    try {
      // Get all votes for this response
      const { data: votesData, error: votesError } = await supabase
        .from('peer_votes')
        .select('score')
        .eq('response_id', responseId);

      if (votesError || !votesData || votesData.length === 0) return;

      // Calculate average score
      const averageScore = Math.round(
        votesData.reduce((sum, vote) => sum + vote.score, 0) / votesData.length
      );

      // Update response score
      await supabase
        .from('scenario_responses')
        .update({ score: averageScore })
        .eq('id', responseId);
    } catch (error) {
      console.error('Error recalculating response score:', error);
    }
  };

  const getResponsesForVoting = () => {
    if (!player) return [];
    
    // Get responses from other players that haven't been voted on yet
    return responses.filter(response => 
      response.player_id !== player.id && 
      !votes.some(vote => vote.response_id === response.id)
    );
  };

  const getUserResponse = (scenarioId: string) => {
    if (!player) return null;
    return responses.find(r => r.player_id === player.id && r.scenario_id === scenarioId);
  };

  return {
    scenarios,
    responses,
    votes,
    loading,
    error,
    submitResponse,
    submitVote,
    getResponsesForVoting,
    getUserResponse,
    refreshData: loadScenarioData,
  };
}