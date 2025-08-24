import React, { useState } from 'react';
import { DollarSign, Users, Play, Trophy, Clock, Shuffle } from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';

interface GameSessionSetupProps {
  onSessionReady: () => void;
}

export function GameSessionSetup({ onSessionReady }: GameSessionSetupProps) {
  const { 
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
    getUserDonation,
    getUserParticipation,
    getUserBudget
  } = useGameSession();

  const [sessionName, setSessionName] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    'Executive Director',
    'Treasurer', 
    'Secretary',
    'Fundraising Director',
    'Program Director',
    'Project Director',
    'Grant Writer',
    'Tech & App Dev / Marketing-Communications Director'
  ];

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return;
    
    setSubmitting(true);
    await createGameSession(sessionName);
    setSubmitting(false);
    setSessionName('');
  };

  const handleJoinSession = async () => {
    if (!currentSession) return;
    
    setSubmitting(true);
    const assignedRole = await joinSessionWithRandomRole(currentSession.id);
    setSubmitting(false);
    
    if (assignedRole) {
      console.log(`Assigned role: ${assignedRole}`);
    }
  };

  const handleDonation = async () => {
    if (!currentSession || !donationAmount) return;
    
    const amount = parseFloat(donationAmount);
    if (amount <= 0) return;
    
    setSubmitting(true);
    await makeDonation(currentSession.id, amount);
    setSubmitting(false);
    setDonationAmount('');
  };

  const handleStartDonations = async () => {
    if (!currentSession) return;
    
    setSubmitting(true);
    await startDonationPhase(currentSession.id);
    setSubmitting(false);
  };

  const handleStartMeeting = async () => {
    if (!currentSession) return;
    
    setSubmitting(true);
    await startMeeting(currentSession.id);
    setSubmitting(false);
    onSessionReady();
  };

  const userDonation = getUserDonation();
  const userParticipation = getUserParticipation();
  const userBudget = getUserBudget();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Board Meeting Game Session</h2>

        {!currentSession && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Session</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCreateSession}
                disabled={!sessionName.trim() || submitting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        )}

        {currentSession && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{currentSession.name}</h3>
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-1" />
                Status: {currentSession.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {currentSession.status === 'setup' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Join Session with Random Role</h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Shuffle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Random Role Assignment</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Click "Join Session" to be randomly assigned one of the 8 board roles. Each role has unique 
                        responsibilities and scenario questions during the meeting.
                      </p>
                    </div>
                  </div>
                </div>

                {!userParticipation ? (
                  <button
                    onClick={handleJoinSession}
                    disabled={submitting || participants.length >= 8}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
                  >
                    <Shuffle className="w-5 h-5 mr-2" />
                    {submitting ? 'Joining...' : 'Join Session (Random Role)'}
                  </button>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      🎉 You've been assigned the role: <strong>{userParticipation.role_name}</strong>
                    </p>
                  </div>
                )}

                {participants.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-slate-800 mb-3">Current Participants ({participants.length}/8)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {participants.map(participant => (
                        <div key={participant.id} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-slate-800">
                            {participant.role_name}
                          </p>
                          <p className="text-xs text-slate-600">
                            Joined {new Date(participant.joined_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {participants.length >= 3 && (
                  <button
                    onClick={handleStartDonations}
                    disabled={submitting}
                    className="mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Start Donation Phase
                  </button>
                )}
              </div>
            )}

            {currentSession.status === 'donations' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Make Your Donation</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 text-sm">
                    <strong>How it works:</strong> All players can donate to fund the game! 50% goes to the winner's prize pool, 
                    50% is split equally among all participants as their gameplay budgets for scenarios.
                  </p>
                </div>

                {!userDonation ? (
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Enter donation amount..."
                        min="1"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleDonation}
                      disabled={!donationAmount || submitting}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Donate
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800">
                      Thank you! You've donated <strong>${userDonation.amount.toFixed(2)}</strong>
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-800">${currentSession.total_donations.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">Total Donations</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-800">${currentSession.prize_pool.toFixed(2)}</p>
                    <p className="text-sm text-green-600">Prize Pool (50%)</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-800">
                      ${userBudget ? userBudget.allocated_amount.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-purple-600">Your Budget</p>
                  </div>
                </div>

                {donations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-800 mb-3">Donations Received</h4>
                    <div className="space-y-2">
                      {donations.map((donation) => (
                        <div key={donation.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-700">Player Donation</span>
                          <span className="font-medium text-slate-800">${donation.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {donations.length > 0 && currentSession.total_donations > 0 && (
                  <button
                    onClick={handleStartMeeting}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center mx-auto"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Board Meeting
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}