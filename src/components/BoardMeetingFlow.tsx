import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, FileText, DollarSign, CheckCircle, ChevronRight, 
  Gavel, ScrollText, Calculator, MessageSquare, Vote, Calendar,
  Star, Send
} from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';
import { useMeetingFlow } from '../hooks/useMeetingFlow';

interface BoardMeetingFlowProps {
  sessionId: string;
}

const agendaItems = [
  { id: 'call_to_order', title: 'Call to Order', icon: Gavel, description: 'Executive Director opens the meeting' },
  { id: 'secretary_report', title: 'Secretary Report', icon: ScrollText, description: 'Review and approve previous minutes' },
  { id: 'treasurer_report', title: 'Treasurer Report', icon: Calculator, description: 'Financial summary and budget allocation' },
  { id: 'committee_reports', title: 'Committee/Role Reports', icon: Users, description: 'Each role presents their scenario questions' },
  { id: 'old_business', title: 'Old Business', icon: FileText, description: 'Follow up on previous motions' },
  { id: 'new_business', title: 'New Business', icon: MessageSquare, description: 'New motions and proposals' },
  { id: 'open_forum', title: 'Open Forum / Scenarios', icon: Star, description: 'Present scenario answers for voting' },
  { id: 'next_agenda', title: 'Next Agenda', icon: Calendar, description: 'Plan items for next meeting' },
  { id: 'adjournment', title: 'Adjournment', icon: CheckCircle, description: 'Executive Director closes meeting' }
];

export function BoardMeetingFlow({ sessionId }: BoardMeetingFlowProps) {
  const { currentSession, participants, getUserParticipation, advanceAgenda } = useGameSession();
  const {
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
  } = useMeetingFlow();

  const [currentMinutes, setCurrentMinutes] = useState('');
  const [previousMinutes, setPreviousMinutes] = useState('');
  const [motionTitle, setMotionTitle] = useState('');
  const [motionDescription, setMotionDescription] = useState('');
  const [scenarioAnswer, setScenarioAnswer] = useState('');
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [agendaItems, setAgendaItems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const userParticipation = getUserParticipation();
  const currentAgendaIndex = agendaItems.findIndex(item => item.id === currentSession?.current_agenda_item);
  const currentAgendaItem = agendaItems[currentAgendaIndex];
  const isExecutiveDirector = userParticipation?.role_name === 'Executive Director';
  const isSecretary = userParticipation?.role_name === 'Secretary';
  const isTreasurer = userParticipation?.role_name === 'Treasurer';

  useEffect(() => {
    if (sessionId) {
      loadMeetingData(sessionId);
    }
  }, [sessionId]);

  const handleAdvanceAgenda = async () => {
    if (!currentSession || !isExecutiveDirector) return;
    
    const nextIndex = currentAgendaIndex + 1;
    if (nextIndex < agendaItems.length) {
      setSubmitting(true);
      await advanceAgenda(currentSession.id, agendaItems[nextIndex].id);
      setSubmitting(false);
    }
  };

  const handleSubmitMinutes = async () => {
    if (!isSecretary) return;
    
    setSubmitting(true);
    await submitMinutes(sessionId, previousMinutes, currentMinutes);
    setSubmitting(false);
    setCurrentMinutes('');
    setPreviousMinutes('');
  };

  const handleVoteOnMinutes = async (vote: 'approve' | 'reject' | 'amend') => {
    setSubmitting(true);
    await voteOnMinutes(sessionId, vote);
    setSubmitting(false);
  };

  const handleSubmitFinancialSummary = async () => {
    if (!isTreasurer || !currentSession) return;
    
    setSubmitting(true);
    await submitFinancialSummary(
      sessionId, 
      currentSession.total_donations, 
      currentSession.prize_pool,
      currentSession.total_donations > 0 ? (currentSession.total_donations - currentSession.prize_pool) / participants.length : 0
    );
    setSubmitting(false);
  };

  const handleProposeMotion = async (motionType: 'old_business' | 'new_business') => {
    if (!motionTitle.trim() || !motionDescription.trim()) return;
    
    setSubmitting(true);
    await proposeMotion(sessionId, motionTitle, motionDescription, motionType);
    setSubmitting(false);
    setMotionTitle('');
    setMotionDescription('');
  };

  const handleVoteOnMotion = async (motionId: string, vote: 'approve' | 'reject' | 'abstain') => {
    setSubmitting(true);
    await voteOnMotion(motionId, vote);
    setSubmitting(false);
  };

  const handleSubmitScenarioAnswer = async (questionId: string) => {
    if (!scenarioAnswer.trim()) return;
    
    setSubmitting(true);
    await submitScenarioAnswer(sessionId, questionId, scenarioAnswer, budgetUsed);
    setSubmitting(false);
    setScenarioAnswer('');
    setBudgetUsed(0);
  };

  const handleVoteOnAnswer = async (answerId: string, coins: number, feedback?: string) => {
    setSubmitting(true);
    await voteOnAnswer(answerId, coins, feedback);
    setSubmitting(false);
  };

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

  if (!currentSession || !userParticipation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-800 font-semibold mb-2">Session Not Found</h3>
          <p className="text-yellow-700">Unable to load meeting session or user participation.</p>
        </div>
      </div>
    );
  }

  const renderAgendaContent = () => {
    switch (currentSession.current_agenda_item) {
      case 'call_to_order':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Meeting Called to Order</h3>
              <p className="text-blue-700">
                The Executive Director has officially started the meeting. All participants are present and accounted for.
              </p>
            </div>
            {isExecutiveDirector && (
              <button
                onClick={handleAdvanceAgenda}
                disabled={submitting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                Proceed to Secretary Report
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        );

      case 'secretary_report':
        return (
          <div className="space-y-6">
            {isSecretary && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Secretary Report</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Previous Meeting Minutes
                    </label>
                    <textarea
                      value={previousMinutes}
                      onChange={(e) => setPreviousMinutes(e.target.value)}
                      placeholder="Enter previous meeting minutes..."
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Meeting Notes
                    </label>
                    <textarea
                      value={currentMinutes}
                      onChange={(e) => setCurrentMinutes(e.target.value)}
                      placeholder="Record current meeting proceedings..."
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={handleSubmitMinutes}
                    disabled={submitting || !currentMinutes.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Submit Minutes
                  </button>
                </div>
              </div>
            )}

            {meetingMinutes && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Minutes Approval</h4>
                {meetingMinutes.previous_minutes && (
                  <div className="mb-4">
                    <h5 className="font-medium text-slate-700 mb-2">Previous Minutes:</h5>
                    <p className="text-slate-600 whitespace-pre-wrap">{meetingMinutes.previous_minutes}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVoteOnMinutes('approve')}
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVoteOnMinutes('reject')}
                    disabled={submitting}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVoteOnMinutes('amend')}
                    disabled={submitting}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Amend
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'treasurer_report':
        return (
          <div className="space-y-6">
            {isTreasurer && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Treasurer Report</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-800">${currentSession.total_donations.toFixed(2)}</p>
                    <p className="text-sm text-purple-600">Total Donations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-800">${currentSession.prize_pool.toFixed(2)}</p>
                    <p className="text-sm text-purple-600">Prize Pool (50%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-800">
                      ${participants.length > 0 ? ((currentSession.total_donations - currentSession.prize_pool) / participants.length).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-purple-600">Budget per Player</p>
                  </div>
                </div>
                <button
                  onClick={handleSubmitFinancialSummary}
                  disabled={submitting}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Present Financial Summary
                </button>
              </div>
            )}

            {financialSummary && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Budget Approval</h4>
                <p className="text-slate-600 mb-4">
                  The Treasurer has presented the financial summary. Do you approve the budget allocation?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {/* Handle budget approval */}}
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Approve Budget
                  </button>
                  <button
                    onClick={() => challengeBudget(sessionId, 'Budget challenge reason')}
                    disabled={submitting}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Challenge Budget
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'committee_reports':
        const roleQuestions = getQuestionsForRole(userParticipation.role_name);
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Committee/Role Reports</h3>
              <p className="text-amber-700">
                Each role presents their scenario questions. Answer the questions relevant to your role.
              </p>
            </div>

            {roleQuestions.map((question) => {
              const userAnswer = getUserAnswer(question.id);
              return (
                <div key={question.id} className="bg-white border border-slate-200 rounded-lg p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">{question.question_text}</h4>
                  
                  {userAnswer ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">Answer Submitted</p>
                      <p className="text-green-700 mt-2">{userAnswer.answer_text}</p>
                      {userAnswer.budget_used > 0 && (
                        <p className="text-green-600 text-sm mt-1">Budget Used: ${userAnswer.budget_used.toFixed(2)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        value={scenarioAnswer}
                        onChange={(e) => setScenarioAnswer(e.target.value)}
                        placeholder="Enter your detailed answer..."
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                      
                      {question.question_type === 'budget_allocation' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Budget to Use (Optional)
                          </label>
                          <input
                            type="number"
                            value={budgetUsed}
                            onChange={(e) => setBudgetUsed(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleSubmitScenarioAnswer(question.id)}
                        disabled={submitting || !scenarioAnswer.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'open_forum':
        const answersForVoting = getAnswersForVoting();
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Open Forum - Scenario Voting</h3>
              <p className="text-indigo-700">
                Vote on peer scenario answers. Award 1-10 coins based on quality (10 being the best).
              </p>
            </div>

            {answersForVoting.map((answer) => {
              const question = scenarioQuestions.find(q => q.id === answer.question_id);
              const participant = participants.find(p => p.player_id === answer.player_id);
              
              return (
                <div key={answer.id} className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-800">{participant?.role_name}</h4>
                      <p className="text-sm text-slate-600">{question?.question_text}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(answer.submitted_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-slate-700">{answer.answer_text}</p>
                    {answer.budget_used > 0 && (
                      <p className="text-slate-600 text-sm mt-2">Budget Used: ${answer.budget_used.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">Award Coins:</span>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((coins) => (
                      <button
                        key={coins}
                        onClick={() => handleVoteOnAnswer(answer.id, coins)}
                        disabled={submitting}
                        className="w-8 h-8 rounded-full border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 text-sm font-medium transition-colors"
                      >
                        {coins}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {answersForVoting.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600">No answers available for voting at this time.</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {currentAgendaItem?.title || 'Unknown Agenda Item'}
            </h3>
            <p className="text-slate-600">
              {currentAgendaItem?.description || 'This agenda item is not yet implemented.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Board Meeting in Session</h2>
            <p className="text-slate-600">
              Role: <strong>{userParticipation.role_name}</strong> • 
              Session: <strong>{currentSession.name}</strong>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-slate-500 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              Agenda Item {currentAgendaIndex + 1} of {agendaItems.length}
            </div>
            <div className="w-48 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentAgendaIndex + 1) / agendaItems.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Agenda Item */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center">
              {currentAgendaItem && (
                <currentAgendaItem.icon className="w-6 h-6 text-blue-600 mr-3" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-1">
                  {currentAgendaItem?.title || 'Unknown Agenda Item'}
                </h3>
                <p className="text-slate-600">
                  {currentAgendaItem?.description || 'This agenda item is not yet implemented.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda Content */}
        <div className="mb-8">
          {renderAgendaContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            {participants.length} participants • Meeting in progress
          </div>
          
          {isExecutiveDirector && currentAgendaIndex < agendaItems.length - 1 && (
            <button
              onClick={handleAdvanceAgenda}
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              Next Agenda Item
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}

          {isExecutiveDirector && currentAgendaIndex === agendaItems.length - 1 && (
            <button
              onClick={() => {/* Handle meeting completion */}}
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Complete Meeting
            </button>
          )}
        </div>
      </div>
    </div>
  );
}