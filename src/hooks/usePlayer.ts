import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Player = Database['public']['Tables']['players']['Row'];
type Badge = Database['public']['Tables']['player_badges']['Row'];

export function usePlayer() {
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPlayerData();
    } else {
      setPlayer(null);
      setBadges([]);
      setLoading(false);
    }
  }, [user]);

  const loadPlayerData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Load player profile
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (playerError) {
        if (playerError.code === 'PGRST116') {
          // Player doesn't exist, create one
          const { data: newPlayer, error: createError } = await supabase
            .from('players')
            .insert({
              auth_id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Player',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating player:', createError);
            setError(createError.message);
            return;
          }
          
          setPlayer(newPlayer);
        } else {
          console.error('Error loading player:', playerError);
          setError(playerError.message);
          return;
        }
      } else if (playerData) {
        setPlayer(playerData);
      }

      // Load badges
      if (playerData?.id) {
        const { data: badgesData, error: badgesError } = await supabase
          .from('player_badges')
          .select('*')
          .eq('player_id', playerData.id);

        if (badgesError) {
          console.error('Error loading badges:', badgesError);
          setError(badgesError.message);
        } else {
          setBadges(badgesData || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading player data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerRole = async (role: string) => {
    if (!user || !player) return;

    const { error } = await supabase
      .from('players')
      .update({ role })
      .eq('id', player.id);

    if (error) {
      console.error('Error updating player role:', error);
      setError(error.message);
      return;
    }

    setPlayer(prev => prev ? { ...prev, role } : null);
  };

  const updatePlayerScore = async (scoreIncrease: number) => {
    if (!user || !player) return;

    const newScore = player.score + scoreIncrease;
    const { error } = await supabase
      .from('players')
      .update({ score: newScore })
      .eq('id', player.id);

    if (error) {
      console.error('Error updating player score:', error);
      setError(error.message);
      return;
    }

    setPlayer(prev => prev ? { ...prev, score: newScore } : null);
  };

  const awardBadge = async (badge: string) => {
    if (!user || !player) return;

    // Check if badge already exists
    const existingBadge = badges.find(b => b.badge === badge);
    if (existingBadge) return;

    const { error } = await supabase
      .from('player_badges')
      .insert({
        player_id: player.id,
        badge,
      });

    if (error) {
      console.error('Error awarding badge:', error);
      setError(error.message);
      return;
    }

    loadPlayerData();
  };

  return {
    player,
    badges,
    loading,
    error,
    updatePlayerRole,
    updatePlayerScore,
    awardBadge,
    refreshData: loadPlayerData,
  };
}