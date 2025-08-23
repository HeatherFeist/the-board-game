import React, { useState } from 'react';
import { Star, Send, User, Calendar, MessageSquare } from 'lucide-react';
import { Database } from '../lib/supabase';

type ScenarioResponse = Database['public']['Tables']['scenario_responses']['Row'] & {
  players: { name: string };
};

interface PeerVotingProps {
  response: ScenarioResponse;
  onSubmitVote: (responseId: string, score: number) => void;
  loading?: boolean;
}

export function PeerVoting({ response, onSubmitVote, loading = false }: PeerVotingProps) {
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (score > 0) {
      onSubmitVote(response.id, score);
      setScore(0);
      setFeedback('');
    }
  };

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
            <h3 className="font-semibold text-slate-800">{response.players?.name || 'Anonymous'}</h3>
            <div className="flex items-center text-sm text-slate-500">
              <Calendar className="w-4 h-4 mr-1" />
              Submitted {formatDate(response.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="font-medium text-slate-800 mb-3">Response</h4>
        <p className="text-slate-700">{response.answer}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 mb-4">Rate This Response</h4>
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setScore(rating)}
                className={`p-2 rounded-lg transition-colors ${
                  score >= rating
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                <Star 
                  className={`w-6 h-6 ${
                    score >= rating ? 'fill-current' : ''
                  }`} 
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-slate-600">
              {score > 0 ? `${score}/5` : 'Not rated'}
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p><strong>1 Star:</strong> Poor response, lacks understanding</p>
            <p><strong>3 Stars:</strong> Good response, shows competence</p>
            <p><strong>5 Stars:</strong> Excellent response, demonstrates mastery</p>
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
              placeholder="Provide constructive feedback..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={300}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{feedback.length}/300 characters</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={score === 0 || loading}
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