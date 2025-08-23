import React, { useState } from 'react';
import { FileText, Users, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useMeetings } from '../hooks/useMeetings';
import { usePlayer } from '../hooks/usePlayer';
import { useScenarios } from '../hooks/useScenarios';

interface MeetingFlowProps {
  meetingId: string;
}

export function MeetingFlow({ meetingId }: MeetingFlowProps) {
  const { currentMeeting, updateMeetingMinutes, submitReflection, getUserReflection } = useMeetings();
  const { player } = usePlayer();
  const { scenarios, submitResponse, getUserResponse } = useScenarios();
  const [minutes, setMinutes] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const isSecretary = player?.role === 'Secretary';
  const userReflection = getUserReflection(meetingId);
  const roleScenarios = scenarios.filter(s => s.role === player?.role);

  const handleMinutesSubmit = async () => {
    if (!currentMeeting || !minutes.trim()) return;
    
    const minutesData = {
      secretary: player?.name,
      content: minutes,
      timestamp: new Date().toISOString(),
    };
    
    await updateMeetingMinutes(currentMeeting.id, minutesData);
    setMinutes('');
  };

  const handleAnswerSelect = (scenarioId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [scenarioId]: answer
    }));
  };

  const handleScenarioSubmit = async (scenarioId: string) => {
    const answer = selectedAnswers[scenarioId];
    if (!answer) return;
    
    await submitResponse(scenarioId, answer);
  };

  const handleReflectionSubmit = async () => {
    if (!currentMeeting || !reflection.trim()) return;
    
    await submitReflection(currentMeeting.id, reflection);
    setReflection('');
  };

  if (!currentMeeting || !player) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{currentMeeting.title}</h2>
            <p className="text-slate-600">
              Role: <strong>{player.role}</strong> • Score: <strong>{player.score}</strong>
            </p>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="w-4 h-4 mr-1" />
            Meeting in Progress
          </div>
        </div>

        {/* Secretary Minutes Section */}
        {isSecretary && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Meeting Minutes (Secretary Only)
            </h3>
            <textarea
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Record key decisions, action items, and important discussions..."
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
            />
            <button
              onClick={handleMinutesSubmit}
              disabled={!minutes.trim()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Submit Minutes
            </button>
          </div>
        )}

        {/* Previous Minutes Display */}
        {currentMeeting.minutes && Object.keys(currentMeeting.minutes).length > 0 && (
          <div className="mb-8 p-6 bg-slate-50 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Previous Meeting Minutes</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-slate-600 mb-2">
                Recorded by: <strong>{(currentMeeting.minutes as any).secretary}</strong>
              </p>
              <div className="whitespace-pre-wrap text-slate-700">
                {(currentMeeting.minutes as any).content}
              </div>
            </div>
          </div>
        )}

        {/* Role-Specific Questions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Your Role Questions
          </h3>
          <div className="space-y-6">
            {roleScenarios.map((scenario) => {
              const userResponse = getUserResponse(scenario.id);
              const options = Array.isArray(scenario.options) ? scenario.options : [];
              
              return (
                <div key={scenario.id} className="border border-slate-200 rounded-lg p-6">
                  <h4 className="font-medium text-slate-800 mb-4">{scenario.question}</h4>
                  
                  {userResponse ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">Response Submitted</p>
                          <p className="text-sm text-green-600">Your answer: {userResponse.answer}</p>
                          <p className="text-sm text-green-600">Score: {userResponse.score}/5</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {options.map((option: string, index: number) => (
                        <label key={index} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="radio"
                            name={scenario.id}
                            value={option}
                            checked={selectedAnswers[scenario.id] === option}
                            onChange={(e) => handleAnswerSelect(scenario.id, e.target.value)}
                            className="mr-3 text-blue-500"
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                      <button
                        onClick={() => handleScenarioSubmit(scenario.id)}
                        disabled={!selectedAnswers[scenario.id]}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Meeting Reflection */}
        <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Meeting Reflection
          </h3>
          
          {userReflection ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-800 mb-2">Reflection Submitted</p>
              <p className="text-green-700">{userReflection.reflection_text}</p>
            </div>
          ) : (
            <div>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Reflect on the meeting: What went well? What could be improved? Key takeaways?"
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={4}
              />
              <button
                onClick={handleReflectionSubmit}
                disabled={!reflection.trim()}
                className="mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Submit Reflection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}