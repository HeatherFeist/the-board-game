import React, { useState } from 'react';
import { Users, Trophy, BookOpen, Settings, User, Vote, Calendar, Award, ChevronRight, Play, Crown, DollarSign, FileText, Target, Briefcase, Heart, PenTool, Megaphone, Code } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { usePlayer } from './hooks/usePlayer';
import { useScenarios } from './hooks/useScenarios';
import { useMeetings } from './hooks/useMeetings';
import { useDonations } from './hooks/useDonations';
import { AuthModal } from './components/AuthModal';
import { AdminSchemaBanner } from './components/AdminSchemaBanner';
import { PeerVoting } from './components/PeerVoting';
import { MeetingFlow } from './components/MeetingFlow';
import { DonationSystem } from './components/DonationSystem';

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
    id: 'Executive Director',
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
    id: 'Treasurer',
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
    id: 'Secretary',
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
    id: 'Program Director',
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
    id: 'Project Director',
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
    id: 'Fundraising Director',
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
    id: 'Grant Writer',
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
    id: 'Tech & App Dev / Marketing-Communications Director',
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
  const { user, loading: authLoading, signOut } = useAuth();
  const { player, badges, loading: playerLoading, error: playerError, updatePlayerRole, updatePlayerScore } = usePlayer();
  const { getResponsesForVoting, submitVote, error: scenariosError } = useScenarios();
  const { currentMeeting, createMeeting } = useMeetings();
  const { getUserDonation } = useDonations();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'roles' | 'dashboard' | 'meeting' | 'voting' | 'donations'>('welcome');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Handle schema errors
  React.useEffect(() => {
    if (playerError?.includes('PGRST205') || scenariosError?.includes('PGRST205')) {
      setSchemaError(playerError || scenariosError || null);
    }
  }, [playerError, scenariosError]);

  const handleRoleSelection = async (role: Role) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedRole(role);
    await updatePlayerRole(role.id);
    setCurrentView('dashboard');
  };

  const handleStartMeeting = async () => {
    if (!currentMeeting) {
      await createMeeting('Board Meeting Session', [
        'Call to Order',
        'Minutes Review',
        'Officer Reports',
        'Old Business',
        'New Business',
        'Adjournment'
      ]);
    }
    setCurrentView('meeting');
  };

  const handleVoteSubmit = async (responseId: string, score: number) => {
    await submitVote(responseId, score);
    await updatePlayerScore(5); // Award points for voting
  };

  if (authLoading || playerLoading) {
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
                setCurrentView('roles');
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {user ? 'Choose Your Role' : 'Sign In to Start Playing'}
            <ChevronRight className="w-5 h-5 ml-2 inline-block" />
          </button>
        </div>
      </div>
    </div>
  );

  const RoleSelectionPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminSchemaBanner error={schemaError || undefined} onDismiss={() => setSchemaError(null)} />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Choose Your Role</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select a board role to begin your training simulation. Each role offers unique challenges 
            and learning opportunities based on real organizational responsibilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {roles.map((role) => (
            <div 
              key={role.id}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleRoleSelection(role)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-600 transition-colors">
                    {role.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{role.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      role.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      role.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {role.difficulty}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              
              <p className="text-slate-600 mb-4 text-sm">{role.description}</p>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 text-sm">Key Responsibilities:</h4>
                <ul className="space-y-2">
                  {role.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 text-xs">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentView('welcome')}
            className="text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            ← Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => {
    const userDonation = getUserDonation();
    const responsesToVote = getResponsesForVoting();
    
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminSchemaBanner error={schemaError || undefined} onDismiss={() => setSchemaError(null)} />
        
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
                  {selectedRole?.icon}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">{player?.role} Dashboard</h1>
                  <p className="text-slate-600 text-sm">Score: {player?.score || 0} points</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('donations')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {userDonation ? 'View Donations' : 'Make Donation'}
                </button>
                <button
                  onClick={handleStartMeeting}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Join Meeting
                </button>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Welcome back,</p>
                  <p className="font-medium text-slate-800">{player?.name || user?.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Peer Voting Section */}
              {responsesToVote.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Peer Voting</h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Vote on peer responses to earn points!</strong> Your votes help validate 
                      the quality of responses and contribute to fair scoring.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('voting')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Vote on {responsesToVote.length} Response{responsesToVote.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}

              {/* Meeting Status */}
              {currentMeeting && (
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-slate-800">{currentMeeting.title}</h3>
                      <p className="text-sm text-slate-600">
                        Status: {currentMeeting.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentView('donations')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                    <h3 className="font-medium text-slate-800">Donation System</h3>
                    <p className="text-sm text-slate-600">Contribute to game funding</p>
                  </button>
                  
                  <button
                    onClick={handleStartMeeting}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <h3 className="font-medium text-slate-800">Board Meeting</h3>
                    <p className="text-sm text-slate-600">Participate in meeting simulation</p>
                  </button>
                  
                  {responsesToVote.length > 0 && (
                    <button
                      onClick={() => setCurrentView('voting')}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <Vote className="w-6 h-6 text-purple-600 mb-2" />
                      <h3 className="font-medium text-slate-800">Peer Voting</h3>
                      <p className="text-sm text-slate-600">{responsesToVote.length} responses to review</p>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              {/* Player Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Current Score</p>
                    <p className="text-2xl font-bold text-slate-800">{player?.score || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Role</p>
                    <p className="font-medium text-slate-800">{player?.role || 'Not selected'}</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Badges Earned</h3>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-gradient-to-br from-blue-50 to-teal-50 p-3 rounded-lg border border-blue-200">
                      <Award className="w-5 h-5 text-blue-600 mb-2" />
                      <p className="text-xs font-medium text-slate-800">{badge.badge}</p>
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <div className="col-span-2 text-center py-4">
                      <p className="text-sm text-slate-500">Participate in meetings to earn badges!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VotingPage = () => {
    const responsesToVote = getResponsesForVoting();
    
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-slate-600 hover:text-slate-800 mr-4 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Peer Voting</h1>
                <p className="text-slate-600 text-sm">Review and score peer responses</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-8">
          {responsesToVote.length > 0 ? (
            <div className="space-y-8">
              {responsesToVote.map((response) => (
                <PeerVoting
                  key={response.id}
                  response={response}
                  onSubmitVote={handleVoteSubmit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Vote className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">No Responses to Vote On</h2>
              <p className="text-slate-600">Check back later for new peer responses to review.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {currentView === 'welcome' && <WelcomePage />}
      {currentView === 'roles' && <RoleSelectionPage />}
      {currentView === 'dashboard' && <DashboardPage />}
      {currentView === 'meeting' && currentMeeting && (
        <div className="min-h-screen bg-slate-50">
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-slate-600 hover:text-slate-800 mr-4 transition-colors"
                >
                  ← Back to Dashboard
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">Board Meeting</h1>
                  <p className="text-slate-600 text-sm">Participate in the meeting simulation</p>
                </div>
              </div>
            </div>
          </header>
          <MeetingFlow meetingId={currentMeeting.id} />
        </div>
      )}
      {currentView === 'voting' && <VotingPage />}
      {currentView === 'donations' && (
        <div className="min-h-screen bg-slate-50">
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-slate-600 hover:text-slate-800 mr-4 transition-colors"
                >
                  ← Back to Dashboard
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">Donation System</h1>
                  <p className="text-slate-600 text-sm">Contribute to game funding and budgets</p>
                </div>
              </div>
            </div>
          </header>
          <DonationSystem />
        </div>
      )}
    </div>
  );
}

export default App;