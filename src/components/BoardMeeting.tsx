import React, { useState } from 'react';
import { Clock, Users, FileText, DollarSign, CheckCircle, ChevronRight } from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { useGameSession } from '../hooks/useGameSession';
import { getMeetingQuestions } from '../data/meetingQuestions';

interface BoardMeetingProps {
  gameSessionId: string;
}

export function BoardMeeting({ gameSessionId }: BoardMeetingProps) {
  const { currentMeeting, createMeetingSession, advanceMeetingAgenda, submitMeetingResponse, getUserResponse } = useMeeting();
  const { getUserParticipation, getRoleBudget } = useGameSession();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const userParticipation = getUserParticipation();
  const userBudget = userParticipation ? getRoleBudget(userParticipation.role_id) : null;

  const agendaItems = [
    { id: 'call_to_order', title: 'Call to Order', description: 'Opening the meeting and establishing quorum' },
    { id: 'minutes_review', title: 'Minutes Review', description: 'Review and approve previous meeting minutes' },
    { id: 'reports', title: 'Officer Reports', description: 'Financial, program, and departmental reports' },
    { id: 'old_business', title: 'Old Business', description: 'Follow up on previous action items' },
    { id: 'new_business', title: 'New Business', description: 'New proposals and initiatives' },
    { id: 'adjournment', title: 'Adjournment', description: 'Closing the meeting and next steps' }
  ];

  React.useEffect(() => {
    if (!currentMeeting && gameSessionId) {
      createMeetingSession(gameSessionId);
    }
  }, [gameSessionId, currentMeeting, createMeetingSession]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitResponses = async () => {
    if (!currentMeeting || !userParticipation) return;

    setSubmitting(true);
    await submitMeetingResponse(currentMeeting.id, currentMeeting.status, responses);
    setSubmitting(false);
    setResponses({});
  };

  const handleAdvanceAgenda = async () => {
    if (!currentMeeting) return;
    await advanceMeetingAgenda(currentMeeting.id);
  };

  if (!currentMeeting || !userParticipation) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currentAgendaIndex = agendaItems.findIndex(item => item.id === currentMeeting.status);
  const currentAgendaItem = agendaItems[currentAgendaIndex];
  const questions = getMeetingQuestions(currentMeeting.status, userParticipation.role_id);
  const userResponse = getUserResponse(currentMeeting.status);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Board Meeting in Session</h2>
            <p className="text-slate-600">
              Role: <strong>{userParticipation.role_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
              {userBudget && (
                <span className="ml-4">
                  Budget: <strong>${userBudget.allocated_budget.toFixed(2)}</strong>
                </span>
              )}
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

        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{currentAgendaItem.title}</h3>
            <p className="text-slate-600">{currentAgendaItem.description}</p>
          </div>
        </div>

        {questions.length > 0 && !userResponse && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-800 mb-6">Your Participation</h4>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border border-slate-200 rounded-lg p-6">
                  <h5 className="font-medium text-slate-800 mb-4">{question.text}</h5>

                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={responses[question.id] === option}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            className="mr-3 text-blue-500"
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'text' && (
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder="Enter your detailed response..."
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={question.maxLength}
                    />
                  )}

                  {question.type === 'scale' && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex flex-col items-center cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={value}
                              checked={responses[question.id] === value}
                              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                              className="mb-2 text-blue-500"
                            />
                            <span className="text-sm text-slate-600">{value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === 'budget' && userBudget && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-2">Available Budget: ${userBudget.allocated_budget.toFixed(2)}</p>
                        <input
                          type="number"
                          value={responses[question.id] || ''}
                          onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value) || 0)}
                          placeholder="Enter budget allocation..."
                          min="0"
                          max={userBudget.allocated_budget}
                          step="0.01"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitResponses}
              disabled={submitting || questions.some(q => responses[q.id] === undefined)}
              className="mt-6 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Submit Response
            </button>
          </div>
        )}

        {userResponse && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800">Response Submitted</h4>
                <p className="text-sm text-green-600">
                  You earned {userResponse.points_earned} points for this agenda item.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Waiting for all participants to respond...
          </div>
          
          {currentAgendaIndex < agendaItems.length - 1 && (
            <button
              onClick={handleAdvanceAgenda}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              Next Agenda Item
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}

          {currentAgendaIndex === agendaItems.length - 1 && (
            <button
              onClick={() => {/* Handle meeting completion */}}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Complete Meeting
            </button>
          )}
        </div>
      </div>
    </div>
  );
}