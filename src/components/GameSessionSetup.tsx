import React, { useState } from 'react';
import { DollarSign, Users, Play, Trophy, Clock } from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';

interface GameSessionSetupProps {
  onSessionReady: () => void;
}

export function GameSessionSetup({ onSessionReady }: GameSessionSetupProps) {
  const { 
    currentSession, 
    donations, 
    participants, 
    loading,
    createGameSession,
    joinSession,
    makeDonation,
    startDonationPhase,
    startMeeting,
    getUserDonation,
    getUserParticipation
  } = useGameSession();

  const [sessionName, setSessionName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    'executive-director', 'treasurer', 'secretary', 'program-director',
    'project-director', 'fundraising-director', 'grant-writer',
    'marketing-communications', 'app-developer'
  ];

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return;
    
    setSubmitting(true);
    await createGameSession(sessionName);
    setSubmitting(false);
    setSessionName('');
  };

  const handleJoinSession = async () => {
    if (!currentSession || !selectedRole) return;
    
    setSubmitting(true);
    await joinSession(currentSession.id, selectedRole);
    setSubmitting(false);
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

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const prizePool = totalDonations * 0.5;
  const operatingBudget = totalDonations - prizePool;
  const budgetPerRole = operatingBudget / 9;

  const userDonation = getUserDonation();
  const userParticipation = getUserParticipation();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Join Session</h3>
                {!userParticipation ? (
                  <div className="flex gap-4">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your role...</option>
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleJoinSession}
                      disabled={!selectedRole || submitting}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Join as {selectedRole ? selectedRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Role'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      You've joined as: <strong>{userParticipation.role_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
                    </p>
                  </div>
                )}

                {participants.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-slate-800 mb-3">Current Participants ({participants.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {participants.map(participant => (
                        <div key={participant.id} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-slate-800">
                            {participant.role_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    <strong>How it works:</strong> Your donations fund the game! 50% goes to the winner's prize pool, 
                    50% is split equally among all roles as their operating budgets for scenarios.
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
                    <p className="text-2xl font-bold text-blue-800">${totalDonations.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">Total Donations</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-800">${prizePool.toFixed(2)}</p>
                    <p className="text-sm text-green-600">Prize Pool (50%)</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-800">${budgetPerRole.toFixed(2)}</p>
                    <p className="text-sm text-purple-600">Budget per Role</p>
                  </div>
                </div>

                {donations.length >= participants.length && totalDonations > 0 && (
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