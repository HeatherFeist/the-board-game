import React, { useState } from 'react';
import { Users, Trophy, Play, Crown, DollarSign, FileText, Target, Briefcase, Heart, PenTool, Code, ChevronRight } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useGameSession } from './hooks/useGameSession';
import { AuthModal } from './components/AuthModal';
import { AdminSchemaBanner } from './components/AdminSchemaBanner';
import { GameSessionSetup } from './components/GameSessionSetup';
import { BoardMeetingFlow } from './components/BoardMeetingFlow';

interface Role {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
}

const roles: Role[] = [
  {
    id: 'executive-director',
    title: 'Executive Director',
    description: 'Lead the organization\'s strategic vision and overall operations',
    responsibilities: [
      'Strategic planning and organizational leadership',
      'Board meeting facilitation and governance',
      'Stakeholder relationship management',
      'Organizational policy development and implementation'
    ],
    difficulty: 'Advanced',
    icon: <Crown className="w-6 h-6" />
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    description: 'Manage financial resources, budgets, and fiscal planning',
    responsibilities: [
      'Budget planning and oversight',
      'Financial reporting to the board',
      'Expense approval workflows',
      'Revenue tracking and forecasting'
    ],
    difficulty: 'Advanced',
    icon: <DollarSign className="w-6 h-6" />
  },
  {
    id: 'secretary',
    title: 'Secretary',
    description: 'Document meetings, manage communications, and maintain records',
    responsibilities: [
      'Meeting documentation and minutes',
      'Board communications coordination',
      'Record keeping and archiving',
      'Compliance and governance tracking'
    ],
    difficulty: 'Intermediate',
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: 'program-director',
    title: 'Program Director',
    description: 'Oversee program development, implementation, and evaluation',
    responsibilities: [
      'Program strategy and curriculum development',
      'Quality assurance and program evaluation',
      'Participant engagement and outcomes tracking',
      'Cross-program coordination and integration'
    ],
    difficulty: 'Advanced',
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 'project-director',
    title: 'Project Director',
    description: 'Manage specific projects from conception to completion',
    responsibilities: [
      'Project planning and timeline management',
      'Resource allocation and team coordination',
      'Risk assessment and mitigation strategies',
      'Project delivery and stakeholder reporting'
    ],
    difficulty: 'Intermediate',
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    id: 'fundraising-director',
    title: 'Fundraising Director',
    description: 'Develop and execute fundraising strategies and donor relations',
    responsibilities: [
      'Fundraising campaign development and execution',
      'Donor relationship management and stewardship',
      'Corporate partnership and sponsorship development',
      'Fundraising event planning and coordination'
    ],
    difficulty: 'Advanced',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'grant-writer',
    title: 'Grant Writer',
    description: 'Research, write, and manage grant applications and reporting',
    responsibilities: [
      'Grant opportunity research and assessment',
      'Proposal writing and application submission',
      'Grant compliance and reporting management',
      'Funder relationship development and maintenance'
    ],
    difficulty: 'Intermediate',
    icon: <PenTool className="w-6 h-6" />
  },
  {
    id: 'tech-marketing-director',
    title: 'Tech & App Dev / Marketing-Communications Director',
    description: 'Manage technology solutions and marketing communications',
    responsibilities: [
      'Technology development and maintenance',
      'Digital marketing and communications strategy',
      'Brand management and public relations',
      'Technical integration and automation'
    ],
    difficulty: 'Advanced',
    icon: <Code className="w-6 h-6" />
  }
];

function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentSession, loading: sessionLoading, error: sessionError } = useGameSession();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'setup' | 'meeting'>('welcome');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Handle schema errors
  React.useEffect(() => {
    if (sessionError?.includes('PGRST205')) {
      setSchemaError(sessionError);
    }
  }, [sessionError]);

  const handleSessionReady = () => {
    setCurrentView('meeting');
  };

  if (authLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading Board Game...</p>
        </div>
      </div>
    );
  }

  const WelcomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <AdminSchemaBanner error={schemaError || undefined} onDismiss={() => setSchemaError(null)} />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-400 to-teal-400 p-4 rounded-full">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            The Board Game
          </h1>
          <p className="text-xl text-blue-200 mb-4 max-w-3xl mx-auto">
            Training, Simulation, and Gamified Onboarding for Constructive Designs Inc.
          </p>
          <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Step into any board role, experience realistic decision-making scenarios, and build real-world 
            leadership skills through immersive gameplay with peer voting and real monetary stakes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
              <Play className="w-6 h-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Realistic Simulations</h3>
            <p className="text-slate-300">
              Experience authentic scenarios with peer validation and real financial consequences.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="bg-teal-500/20 p-3 rounded-lg w-fit mb-4">
              <Vote className="w-6 h-6 text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Peer Validation</h3>
            <p className="text-slate-300">
              Your responses are scored by peers, ensuring authentic learning and accountability.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4">
              <DollarSign className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Real Stakes</h3>
            <p className="text-slate-300">
              Contribute real money that funds budgets and prizes, making every decision count.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              if (!user) {
                setShowAuthModal(true);
              } else {
                setCurrentView('setup');
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {user ? 'Start Playing' : 'Sign In to Start Playing'}
            <ChevronRight className="w-5 h-5 ml-2 inline-block" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {currentView === 'welcome' && <WelcomePage />}
      {currentView === 'setup' && (
        <div className="min-h-screen bg-slate-50">
          <AdminSchemaBanner error={schemaError || undefined} onDismiss={() => setSchemaError(null)} />
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('welcome')}
                  className="text-slate-600 hover:text-slate-800 mr-4 transition-colors"
                >
                  ← Back to Welcome
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">Game Setup</h1>
                  <p className="text-slate-600 text-sm">Create or join a board meeting session</p>
                </div>
              </div>
            </div>
          </header>
          <GameSessionSetup onSessionReady={handleSessionReady} />
        </div>
      )}
      {currentView === 'meeting' && currentSession && (
        <div className="min-h-screen bg-slate-50">
          <AdminSchemaBanner error={schemaError || undefined} onDismiss={() => setSchemaError(null)} />
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('setup')}
                  className="text-slate-600 hover:text-slate-800 mr-4 transition-colors"
                >
                  ← Back to Setup
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">Board Meeting</h1>
                  <p className="text-slate-600 text-sm">Participate in the meeting simulation</p>
                </div>
              </div>
            </div>
          </header>
          <BoardMeetingFlow sessionId={currentSession.id} />
        </div>
      )}
    </div>
  );
}

export default App;