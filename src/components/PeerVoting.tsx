import React, { useState } from 'react';
import { Star, MessageSquare, Send, User, Calendar } from 'lucide-react';

interface PeerVotingProps {
  response: {
    id: string;
    scenario_id: string;
    role_id: string;
    responses: Record<string, any>;
    submitted_at: string;
    players: { name: string };
  };
  onSubmitVote: (responseId: string, scores: Record<string, number>, feedback?: string) => void;
  loading?: boolean;
}

const votingCriteria = [
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Demonstrates strong leadership qualities and vision'
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Communicates clearly and effectively with stakeholders'
  },
  {
    id: 'decision_making',
    name: 'Decision Making',
    description: 'Makes well-reasoned decisions considering multiple factors'
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Works effectively with others and builds consensus'
  }
];

export function PeerVoting({ response, onSubmitVote, loading = false }: PeerVotingProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [showResponses, setShowResponses] = useState(false);

  const handleScoreChange = (criterionId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: score
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(scores).length === votingCriteria.length) {
      onSubmitVote(response.id, scores, feedback.trim() || undefined);
    }
  };

  const allScoresProvided = votingCriteria.every(criterion => 
    scores[criterion.id] !== undefined
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{response.players.name}</h3>
            <div className="flex items-center text-sm text-slate-500">
              <Calendar className="w-4 h-4 mr-1" />
              Submitted {formatDate(response.submitted_at)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowResponses(!showResponses)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          {showResponses ? 'Hide' : 'View'} Responses
        </button>
      </div>

      {showResponses && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-3">Scenario Responses</h4>
          <div className="space-y-3">
            {Object.entries(response.responses).map(([questionId, answer], index) => (
              <div key={questionId} className="border-l-2 border-blue-200 pl-4">
                <p className="text-sm font-medium text-slate-700 mb-1">Question {index + 1}</p>
                <p className="text-sm text-slate-600">{String(answer)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 mb-4">Rate Performance</h4>
          <div className="space-y-4">
            {votingCriteria.map((criterion) => (
              <div key={criterion.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-slate-800">{criterion.name}</h5>
                    <p className="text-sm text-slate-600">{criterion.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleScoreChange(criterion.id, rating)}
                      className={`p-2 rounded-lg transition-colors ${
                        scores[criterion.id] === rating
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'hover:bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          scores[criterion.id] >= rating ? 'fill-current' : ''
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-slate-600">
                    {scores[criterion.id] ? `${scores[criterion.id]}/5` : 'Not rated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-800 mb-2">
            Feedback (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback on their approach..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{feedback.length}/500 characters</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allScoresProvided || loading}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          Submit Vote
        </button>
      </div>
    </div>
  );
}