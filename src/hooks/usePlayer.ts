import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Player = Database['public']['Tables']['players']['Row'];
type Badge = Database['public']['Tables']['player_badges']['Row'];
type CompletedScenario = Database['public']['Tables']['completed_scenarios']['Row'];

export function usePlayer() {
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<CompletedScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlayerData();
    } else {
      setPlayer(null);
      setBadges([]);
      setCompletedScenarios([]);
      setLoading(false);
    }
  }, [user]);

  const loadPlayerData = async () => {
    if (!user) return;

    try {
      // Load player profile
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single();

      if (playerError) {
        if (playerError.code === 'PGRST116') {
          // Player doesn't exist, create one
          const { data: newPlayer, error: createError } = await supabase
            .from('players')
            .insert({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Player',
              level: 1,
              experience: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating player:', createError);
            return;
          }
          
          setPlayer(newPlayer);
        } else {
          console.error('Error loading player:', playerError);
          return;
        }
      } else if (playerData) {
        setPlayer(playerData);
      }

      // Load badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('player_badges')
        .select('*')
        .eq('player_id', user.id);

      if (badgesError) {
        console.error('Error loading badges:', badgesError);
      } else {
        setBadges(badgesData || []);
      }

      // Load completed scenarios
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('completed_scenarios')
        .select('*')
        .eq('player_id', user.id);

      if (scenariosError) {
        console.error('Error loading completed scenarios:', scenariosError);
      } else {
        setCompletedScenarios(scenariosData || []);
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerRole = async (roleId: string) => {
    if (!user || !player) return;

    const { error } = await supabase
      .from('players')
      .update({ current_role: roleId })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating player role:', error);
      return;
    }

    setPlayer(prev => prev ? { ...prev, current_role: roleId } : null);
  };

  const completeScenario = async (scenarioId: string, roleId: string, score?: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('completed_scenarios')
      .insert({
        player_id: user.id,
        scenario_id: scenarioId,
        role_id: roleId,
        score,
      });

    if (error) {
      console.error('Error completing scenario:', error);
      return;
    }

    // Award experience points
    const experienceGained = score ? score * 10 : 50;
    await updateExperience(experienceGained);

    // Reload data
    loadPlayerData();
  };

  const updateExperience = async (experienceGained: number) => {
    if (!user || !player) return;

    const newExperience = player.experience + experienceGained;
    const newLevel = Math.floor(newExperience / 500) + 1;

    const { error } = await supabase
      .from('players')
      .update({ 
        experience: newExperience,
        level: newLevel
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating experience:', error);
    }
  };

  const awardBadge = async (badgeName: string) => {
    if (!user) return;

    // Check if badge already exists
    const existingBadge = badges.find(badge => badge.badge_name === badgeName);
    if (existingBadge) return;

    const { error } = await supabase
      .from('player_badges')
      .insert({
        player_id: user.id,
        badge_name: badgeName,
      });

    if (error) {
      console.error('Error awarding badge:', error);
      return;
    }

    loadPlayerData();
  };

  return {
    player,
    badges,
    completedScenarios,
    loading,
    updatePlayerRole,
    completeScenario,
    awardBadge,
    refreshData: loadPlayerData,
  };
}