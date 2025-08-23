import React, { useState } from 'react';
import { DollarSign, Trophy, Users, TrendingUp } from 'lucide-react';
import { useDonations } from '../hooks/useDonations';
import { usePlayer } from '../hooks/usePlayer';

export function DonationSystem() {
  const { donations, budgets, prizePool, makeDonation, getUserDonation, getTotalDonations } = useDonations();
  const { player } = usePlayer();
  const [donationAmount, setDonationAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userDonation = getUserDonation();
  const totalDonations = getTotalDonations();
  const userBudget = player?.role ? budgets.find(b => b.category === player.role) : null;

  const handleDonation = async () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) return;

    setSubmitting(true);
    await makeDonation(amount);
    setSubmitting(false);
    setDonationAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Game Funding System</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">How It Works</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Players contribute real money to fund the game</li>
            <li>• 50% goes to the prize pool for the highest scorer</li>
            <li>• 50% is split equally among all 8 roles as operating budgets</li>
            <li>• Use your budget strategically in scenarios and decisions</li>
          </ul>
        </div>

        {/* Donation Input */}
        {!userDonation && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Make Your Contribution</h3>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount..."
                  min="1"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleDonation}
                disabled={!donationAmount || submitting}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {submitting ? 'Processing...' : 'Contribute'}
              </button>
            </div>
          </div>
        )}

        {/* User Donation Status */}
        {userDonation && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-2">Your Contribution</h3>
            <p className="text-green-700">
              Thank you for contributing <strong>${userDonation.amount.toFixed(2)}</strong> to the game!
            </p>
          </div>
        )}

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-blue-800">${totalDonations.toFixed(2)}</p>
            <p className="text-sm text-blue-600">Total Contributions</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-green-800">${prizePool?.total_amount.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-green-600">Prize Pool (50%)</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-purple-800">
              ${budgets.length > 0 ? budgets[0].amount.toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-purple-600">Budget per Role</p>
          </div>
        </div>

        {/* Your Role Budget */}
        {userBudget && (
          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Your Role Budget ({player?.role})
            </h3>
            <p className="text-purple-700">
              Available Budget: <strong>${userBudget.amount.toFixed(2)}</strong>
            </p>
            <p className="text-sm text-purple-600 mt-1">
              Use this budget strategically in meeting scenarios and decision-making processes.
            </p>
          </div>
        )}

        {/* All Role Budgets */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Role Budget Allocation</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">{budget.category}</span>
                <span className="text-slate-600">${budget.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors List */}
        {donations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contributors</h3>
            <div className="space-y-2">
              {donations.map((donation) => (
                <div key={donation.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">{(donation as any).players?.name || 'Anonymous'}</span>
                  <span className="font-medium text-slate-800">${donation.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}