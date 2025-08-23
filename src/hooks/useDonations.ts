import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';
import { usePlayer } from './usePlayer';

type Donation = Database['public']['Tables']['donations']['Row'];
type Budget = Database['public']['Tables']['budgets']['Row'];
type PrizePool = Database['public']['Tables']['prize_pool']['Row'];

export function useDonations() {
  const { user } = useAuth();
  const { player } = usePlayer();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && player) {
      loadDonationData();
    } else {
      setDonations([]);
      setBudgets([]);
      setPrizePool(null);
      setLoading(false);
    }
  }, [user, player]);

  const loadDonationData = async () => {
    if (!user || !player) return;

    try {
      setError(null);

      // Load all donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*, players(name)')
        .order('created_at', { ascending: false });

      if (donationsError) {
        console.error('Error loading donations:', donationsError);
        setError(donationsError.message);
      } else {
        setDonations(donationsData || []);
      }

      // Load budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .order('category');

      if (budgetsError) {
        console.error('Error loading budgets:', budgetsError);
        setError(budgetsError.message);
      } else {
        setBudgets(budgetsData || []);
      }

      // Load prize pool
      const { data: prizePoolData, error: prizePoolError } = await supabase
        .from('prize_pool')
        .select('*')
        .single();

      if (prizePoolError) {
        console.error('Error loading prize pool:', prizePoolError);
        setError(prizePoolError.message);
      } else {
        setPrizePool(prizePoolData);
      }
    } catch (error: any) {
      console.error('Error loading donation data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const makeDonation = async (amount: number) => {
    if (!user || !player) return null;

    try {
      const { data, error } = await supabase
        .from('donations')
        .insert({
          player_id: player.id,
          amount,
        })
        .select()
        .single();

      if (error) {
        console.error('Error making donation:', error);
        setError(error.message);
        return null;
      }

      // Trigger budget recomputation (handled by database trigger)
      await loadDonationData();
      return data;
    } catch (error: any) {
      console.error('Error making donation:', error);
      setError(error.message);
      return null;
    }
  };

  const getUserDonation = () => {
    if (!player) return null;
    return donations.find(d => d.player_id === player.id);
  };

  const getTotalDonations = () => {
    return donations.reduce((sum, donation) => sum + donation.amount, 0);
  };

  const getBudgetForRole = (role: string) => {
    return budgets.find(b => b.category === role);
  };

  return {
    donations,
    budgets,
    prizePool,
    loading,
    error,
    makeDonation,
    getUserDonation,
    getTotalDonations,
    getBudgetForRole,
    refreshData: loadDonationData,
  };
}