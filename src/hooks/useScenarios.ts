import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type ScenarioResponse = Database['public']['Tables']['scenario_responses']['Row'];
type PeerVote = Database['public']['Tables']['peer_votes']['Row'];

export function useScenarios() {
  const { user } = useAuth();
  const [pendingResponses, setPendingResponses] = useState<ScenarioResponse[]>([]);
  const [votingResponses, setVotingResponses] = useState<ScenarioResponse[]>([]);
  const [myVotes, setMyVotes] = useState<PeerVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadScenarioData();
    } else {
      setPendingResponses([]);
      setVotingResponses([]);
      setMyVotes([]);
      setLoading(false);
    }
  }, [user]);

  const loadScenarioData = async () => {
    if (!user) return;

    try {
      // Load responses available for voting (not my own, status = 'voting')
      const { data: votingData, error: votingError } = await supabase
        .from('scenario_responses')
        .select(`
          *,
          players!scenario_responses_player_id_fkey(name)
        `)
        .eq('status', 'voting')
        .neq('player_id', user.id);

      if (votingError) {
        console.error('Error loading voting responses:', votingError);
      } else {
        setVotingResponses(votingData || []);
      }

      // Load my votes
      const { data: votesData, error: votesError } = await supabase
        .from('peer_votes')
        .select('*')
        .eq('voter_id', user.id);

      if (votesError) {
        console.error('Error loading votes:', votesError);
      } else {
        setMyVotes(votesData || []);
      }

      // Load my pending responses
      const { data: pendingData, error: pendingError } = await supabase
        .from('scenario_responses')
        .select('*')
        .eq('player_id', user.id)
        .in('status', ['pending', 'voting']);

      if (pendingError) {
        console.error('Error loading pending responses:', pendingError);
      } else {
        setPendingResponses(pendingData || []);
      }
    } catch (error) {
      console.error('Error loading scenario data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitScenarioResponse = async (
    scenarioId: string,
    roleId: string,
    responses: Record<string, any>
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('scenario_responses')
      .insert({
        player_id: user.id,
        scenario_id: scenarioId,
        role_id: roleId,
        responses,
        status: 'voting'
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting response:', error);
      return null;
    }

    loadScenarioData();
    return data;
  };

  const submitVote = async (
    responseId: string,
    scores: Record<string, number>,
    feedback?: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('peer_votes')
      .upsert({
        response_id: responseId,
        voter_id: user.id,
        scores,
        feedback
      });

    if (error) {
      console.error('Error submitting vote:', error);
      return;
    }

    // Check if this response now has enough votes to be completed
    await checkVotingCompletion(responseId);
    loadScenarioData();
  };

  const checkVotingCompletion = async (responseId: string) => {
    // Get vote count for this response
    const { data: votes, error } = await supabase
      .from('peer_votes')
      .select('*')
      .eq('response_id', responseId);

    if (error || !votes) return;

    // If we have 3 or more votes, mark as completed and calculate final score
    if (votes.length >= 3) {
      const avgScores: Record<string, number> = {};
      const criteria = ['leadership', 'communication', 'decision_making', 'collaboration'];
      
      criteria.forEach(criterion => {
        const scores = votes.map(vote => vote.scores[criterion] || 0);
        avgScores[criterion] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      });

      const finalScore = Math.round(
        Object.values(avgScores).reduce((sum, score) => sum + score, 0) / criteria.length
      );

      // Update response status
      await supabase
        .from('scenario_responses')
        .update({ status: 'completed' })
        .eq('id', responseId);

      // Get response details to create completed scenario record
      const { data: response } = await supabase
        .from('scenario_responses')
        .select('*')
        .eq('id', responseId)
        .single();

      if (response) {
        // Create completed scenario record
        await supabase
          .from('completed_scenarios')
          .insert({
            player_id: response.player_id,
            scenario_id: response.scenario_id,
            role_id: response.role_id,
            score: finalScore,
            response_id: responseId
          });

        // Award experience points
        const experienceGained = finalScore * 20; // 20 XP per point
        const { data: player } = await supabase
          .from('players')
          .select('experience, level')
          .eq('id', response.player_id)
          .single();

        if (player) {
          const newExperience = player.experience + experienceGained;
          const newLevel = Math.floor(newExperience / 500) + 1;

          await supabase
            .from('players')
            .update({
              experience: newExperience,
              level: newLevel
            })
            .eq('id', response.player_id);
        }
      }
    }
  };

  const getResponsesNeedingVotes = () => {
    return votingResponses.filter(response => 
      !myVotes.some(vote => vote.response_id === response.id)
    );
  };

  return {
    pendingResponses,
    votingResponses,
    myVotes,
    loading,
    submitScenarioResponse,
    submitVote,
    getResponsesNeedingVotes,
    refreshData: loadScenarioData
  };
}