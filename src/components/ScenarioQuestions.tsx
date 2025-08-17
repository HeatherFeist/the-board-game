import React, { useState } from 'react';
import { CheckCircle, Clock, Users } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text' | 'scale';
  options?: string[];
  maxLength?: number;
}

interface ScenarioQuestionsProps {
  scenarioId: string;
  scenarioTitle: string;
  questions: Question[];
  onSubmit: (responses: Record<string, any>) => void;
  loading?: boolean;
}

export function ScenarioQuestions({ 
  scenarioId, 
  scenarioTitle, 
  questions, 
  onSubmit, 
  loading = false 
}: ScenarioQuestionsProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  const isCurrentQuestionAnswered = () => {
    const question = questions[currentQuestion];
    const response = responses[question.id];
    return response !== undefined && response !== '' && response !== null;
  };

  const allQuestionsAnswered = () => {
    return questions.every(q => {
      const response = responses[q.id];
      return response !== undefined && response !== '' && response !== null;
    });
  };

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">{scenarioTitle}</h2>
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {question.text}
          </h3>

          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
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
              rows={6}
              maxLength={question.maxLength}
            />
          )}

          {question.type === 'scale' && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
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
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 text-slate-600 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered() || loading}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-8 py-2 rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Submit for Peer Review
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Users className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Peer Review Process</p>
              <p className="text-sm text-blue-600 mt-1">
                Your responses will be reviewed by other organization members who will evaluate your 
                leadership approach, communication skills, and decision-making process. You'll receive 
                detailed feedback and points based on their assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}