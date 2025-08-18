import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useScenarios() {
  const { user } = useAuth();
  const [pendingResponses, setPendingResponses] = useState<any[]>([]);
  const [votingResponses, setVotingResponses] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
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

    // Temporarily disable scenario data loading until tables are created
    setLoading(false);
  };

  const submitScenarioResponse = async (
    scenarioId: string,
    roleId: string,
    responses: Record<string, any>
  ) => {
    if (!user) return null;
    // Temporarily disabled until tables are created
    return null;
  };

  const submitVote = async (
    responseId: string,
    scores: Record<string, number>,
    feedback?: string
  ) => {
    if (!user) return;
    // Temporarily disabled until tables are created
  };

  const getResponsesNeedingVotes = () => {
    return [];
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