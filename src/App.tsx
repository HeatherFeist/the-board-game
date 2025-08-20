import React, { useState } from 'react';
import { Users, Trophy, BookOpen, Settings, User, Vote, Calendar, Award, ChevronRight, Play, Crown, DollarSign, FileText, Target, Briefcase, Heart, PenTool, Megaphone, Code } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { usePlayer } from './hooks/usePlayer';
import { useGameSession } from './hooks/useGameSession';
import { AuthModal } from './components/AuthModal';
import { GameSessionSetup } from './components/GameSessionSetup';
import { BoardMeeting } from './components/BoardMeeting';

interface Role {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'decision' | 'meeting' | 'crisis' | 'planning';
  difficulty: number;
  timeRequired: string;
}

interface Player {
  id: string;
  name: string;
  currentRole: string | null;
  level: number;
  experience: number;
  badges: string[];
  completedScenarios: string[];
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
    id: 'marketing-communications',
    title: 'Marketing/Communications',
    description: 'Manage brand messaging, marketing campaigns, and public relations',
    responsibilities: [
      'Brand strategy and messaging development',
      'Digital marketing and social media management',
      'Public relations and media outreach',
      'Content creation and campaign execution'
    ],
    difficulty: 'Intermediate',
    icon: <Megaphone className="w-6 h-6" />
  },
  {
    id: 'app-developer',
    title: 'App Developer',
    description: 'Design, develop, and maintain organizational technology solutions',
    responsibilities: [
      'Application development and maintenance',
      'Technical architecture and system design',
      'User experience optimization and testing',
      'Technology integration and automation'
    ],
    difficulty: 'Advanced',
    icon: <Code className="w-6 h-6" />
  }
];

const roleScenarios: Record<string, Scenario[]> = {
  'executive-director': [
    {
      id: 'board-meeting-facilitation',
      title: 'Monthly Board Meeting Crisis',
      description: 'Two board members are in heated disagreement about budget allocation. You must facilitate resolution while keeping the meeting productive and maintaining board unity.',
      type: 'meeting',
      difficulty: 4,
      timeRequired: '45 minutes'
    },
    {
      id: 'strategic-pivot',
      title: 'Strategic Direction Pivot',
      description: 'Market conditions have changed dramatically. Lead the board through evaluating whether to pivot the organization\'s core mission or double down on current programs.',
      type: 'planning',
      difficulty: 5,
      timeRequired: '90 minutes'
    },
    {
      id: 'stakeholder-crisis',
      title: 'Major Donor Withdrawal',
      description: 'Your largest donor is threatening to withdraw funding due to concerns about organizational direction. Navigate this delicate situation while preserving relationships.',
      type: 'crisis',
      difficulty: 5,
      timeRequired: '60 minutes'
    }
  ],
  'treasurer': [
    {
      id: 'budget-shortfall',
      title: 'Quarterly Budget Shortfall',
      description: 'Revenue is 30% below projections. Present options to the board: cut programs, seek emergency funding, or restructure operations.',
      type: 'crisis',
      difficulty: 4,
      timeRequired: '60 minutes'
    },
    {
      id: 'annual-budget',
      title: 'Annual Budget Planning',
      description: 'Create next year\'s budget with input from all departments. Balance ambitious program goals with financial reality.',
      type: 'planning',
      difficulty: 3,
      timeRequired: '75 minutes'
    },
    {
      id: 'audit-preparation',
      title: 'External Audit Preparation',
      description: 'Prepare financial records and coordinate with auditors. Address discrepancies found in expense reporting from two departments.',
      type: 'decision',
      difficulty: 4,
      timeRequired: '90 minutes'
    }
  ],
  'secretary': [
    {
      id: 'governance-compliance',
      title: 'Governance Compliance Review',
      description: 'The state has updated nonprofit compliance requirements. Review current practices and implement necessary changes to maintain legal standing.',
      type: 'decision',
      difficulty: 3,
      timeRequired: '45 minutes'
    },
    {
      id: 'meeting-minutes-dispute',
      title: 'Meeting Minutes Dispute',
      description: 'A board member disputes the accuracy of last month\'s minutes regarding a key vote. Navigate this diplomatically while maintaining accurate records.',
      type: 'crisis',
      difficulty: 3,
      timeRequired: '30 minutes'
    },
    {
      id: 'policy-development',
      title: 'New Policy Development',
      description: 'Draft a new conflict of interest policy after a potential issue was raised. Ensure it\'s comprehensive yet practical for board implementation.',
      type: 'planning',
      difficulty: 4,
      timeRequired: '60 minutes'
    }
  ],
  'program-director': [
    {
      id: 'program-evaluation',
      title: 'Program Impact Assessment',
      description: 'Evaluate the effectiveness of three core programs. One is underperforming - recommend whether to modify, replace, or discontinue it.',
      type: 'decision',
      difficulty: 4,
      timeRequired: '75 minutes'
    },
    {
      id: 'curriculum-crisis',
      title: 'Curriculum Content Challenge',
      description: 'Community members have raised concerns about program content being outdated. Rapidly assess and propose curriculum updates while managing stakeholder expectations.',
      type: 'crisis',
      difficulty: 4,
      timeRequired: '60 minutes'
    },
    {
      id: 'new-program-launch',
      title: 'New Program Development',
      description: 'Design and launch a new community program based on identified needs. Coordinate with other departments and establish success metrics.',
      type: 'planning',
      difficulty: 5,
      timeRequired: '90 minutes'
    }
  ],
  'project-director': [
    {
      id: 'project-timeline-crisis',
      title: 'Critical Project Delay',
      description: 'A major project is 3 weeks behind schedule due to vendor issues. Develop recovery plan while managing client expectations and team morale.',
      type: 'crisis',
      difficulty: 4,
      timeRequired: '45 minutes'
    },
    {
      id: 'resource-allocation',
      title: 'Multi-Project Resource Conflict',
      description: 'Three projects need the same specialist team member simultaneously. Negotiate priorities and find creative solutions to avoid delays.',
      type: 'decision',
      difficulty: 3,
      timeRequired: '30 minutes'
    },
    {
      id: 'scope-expansion',
      title: 'Project Scope Expansion Request',
      description: 'A client wants to significantly expand project scope mid-way through. Evaluate feasibility, costs, and impact on other commitments.',
      type: 'decision',
      difficulty: 4,
      timeRequired: '60 minutes'
    }
  ],
  'fundraising-director': [
    {
      id: 'donor-stewardship-crisis',
      title: 'Major Donor Relationship Crisis',
      description: 'A major donor feels neglected and is considering redirecting their annual gift. Develop a stewardship recovery plan and rebuild the relationship.',
      type: 'crisis',
      difficulty: 4,
      timeRequired: '60 minutes'
    },
    {
      id: 'campaign-strategy',
      title: 'Annual Fundraising Campaign',
      description: 'Plan and launch the annual fundraising campaign. Set targets, develop messaging, and coordinate with marketing for maximum impact.',
      type: 'planning',
      difficulty: 4,
      timeRequired: '75 minutes'
    },
    {
      id: 'corporate-partnership',
      title: 'Corporate Partnership Negotiation',
      description: 'A major corporation wants to partner with the organization. Negotiate terms that align with mission while maximizing financial benefit.',
      type: 'decision',
      difficulty: 5,
      timeRequired: '90 minutes'
    }
  ],
  'grant-writer': [
    {
      id: 'urgent-grant-deadline',
      title: 'Last-Minute Grant Opportunity',
      description: 'A perfect-fit $200K grant has a submission deadline in 48 hours. Coordinate rapid response while ensuring quality application.',
      type: 'crisis',
      difficulty: 5,
      timeRequired: '90 minutes'
    },
    {
      id: 'grant-rejection-analysis',
      title: 'Grant Rejection Response',
      description: 'Three major grant applications were rejected. Analyze feedback, identify improvement areas, and develop strategy for resubmission.',
      type: 'decision',
      difficulty: 3,
      timeRequired: '45 minutes'
    },
    {
      id: 'funder-relationship',
      title: 'Funder Relationship Development',
      description: 'Build relationships with five new potential funders. Research their priorities and develop tailored engagement strategies.',
      type: 'planning',
      difficulty: 4,
      timeRequired: '60 minutes'
    }
  ],
  'marketing-communications': [
    {
      id: 'brand-crisis',
      title: 'Social Media Crisis Management',
      description: 'Negative comments about the organization are trending on social media. Develop response strategy while protecting brand reputation.',
      type: 'crisis',
      difficulty: 4,
      timeRequired: '30 minutes'
    },
    {
      id: 'campaign-launch',
      title: 'Major Campaign Launch',
      description: 'Launch a comprehensive marketing campaign for a new program. Coordinate messaging across all channels and measure initial impact.',
      type: 'planning',
      difficulty: 4,
      timeRequired: '75 minutes'
    },
    {
      id: 'media-opportunity',
      title: 'Media Interview Opportunity',
      description: 'A major news outlet wants to interview the Executive Director about organizational impact. Prepare talking points and manage the opportunity.',
      type: 'decision',
      difficulty: 3,
      timeRequired: '45 minutes'
    }
  ],
  'app-developer': [
    {
      id: 'system-outage',
      title: 'Critical System Outage',
      description: 'The main organizational database is down during a crucial fundraising event. Implement emergency solutions while planning permanent fixes.',
      type: 'crisis',
      difficulty: 5,
      timeRequired: '60 minutes'
    },
    {
      id: 'feature-prioritization',
      title: 'Feature Development Prioritization',
      description: 'Multiple departments want new features developed simultaneously. Evaluate requests, assess technical feasibility, and create development roadmap.',
      type: 'decision',
      difficulty: 4,
      timeRequired: '45 minutes'
    },
    {
      id: 'integration-project',
      title: 'Third-Party Integration Project',
      description: 'Integrate the organization\'s systems with a new partner platform. Plan technical architecture while ensuring data security and user experience.',
      type: 'planning',
      difficulty: 5,
      timeRequired: '90 minutes'
    }
  ]
};

const getAvailableScenarios = (roleId: string): Scenario[] => {
  return roleScenarios[roleId] || [];
};

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { player, badges, completedScenarios, loading: playerLoading, updatePlayerRole, completeScenario } = usePlayer();
  const { currentSession } = useGameSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'roles' | 'dashboard' | 'game-setup' | 'meeting'>('welcome');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleSelection = (role: Role) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedRole(role);
    updatePlayerRole(role.id);
    setCurrentView('game-setup');
  };

  const handleScenarioComplete = async (scenarioId: string, score: number) => {
    if (!user || !selectedRole) return;
    
    await completeScenario(scenarioId, selectedRole.id, score);
    setCurrentView('dashboard');
  };

  const handleSessionReady = () => {
    setCurrentView('meeting');
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
            leadership skills through immersive gameplay that mirrors our governance model.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
              <Play className="w-6 h-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Realistic Simulations</h3>
            <p className="text-slate-300">
              Experience authentic scenarios drawn from real organizational challenges and opportunities.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="bg-teal-500/20 p-3 rounded-lg w-fit mb-4">
              <Award className="w-6 h-6 text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Skill Development</h3>
            <p className="text-slate-300">
              Build leadership capabilities through progressive challenges and earn recognition for achievements.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="bg-amber-500/20 p-3 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Real-World Impact</h3>
            <p className="text-slate-300">
              Your in-game performance contributes to real leadership readiness and organizational effectiveness.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              if (!user) {
                setShowAuthModal(true);
              } else {
                setCurrentView('game-setup');
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {user ? 'Join Board Meeting Game' : 'Sign In to Start Playing'}
            <ChevronRight className="w-5 h-5 ml-2 inline-block" />
          </button>
        </div>
      </div>
    </div>
  );

  const RoleSelectionPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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

  const DashboardPage = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
                {selectedRole?.icon}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">{selectedRole?.title} Dashboard</h1>
                <p className="text-slate-600 text-sm">Level {player?.level || 1} • {player?.experience || 0} XP</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('game-setup')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Join Game
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
            {currentSession && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Active Game Session</h3>
                    <p className="text-sm text-slate-600">
                      {currentSession.name} - Status: {currentSession.status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Training Scenarios</h2>
              <div className="space-y-4">
                {getAvailableScenarios(selectedRole?.id || '').map((scenario) => {
                  const isCompleted = completedScenarios.some(cs => cs.scenario_id === scenario.id);
                  return (
                  <div 
                    key={scenario.id}
                    className={`border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors group ${
                      isCompleted ? 'bg-green-50 border-green-200' : ''
                    }`}
                    onClick={() => {
                      // For now, just complete the scenario with a random score
                      handleScenarioComplete(scenario.id, Math.floor(Math.random() * 5) + 1);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-slate-800 mr-3">{scenario.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scenario.type === 'crisis' ? 'bg-red-100 text-red-700' :
                            scenario.type === 'decision' ? 'bg-blue-100 text-blue-700' :
                            scenario.type === 'meeting' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {scenario.type}
                          </span>
                          {isCompleted && (
                            <Award className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{scenario.description}</p>
                        <div className="flex items-center text-xs text-slate-500">
                          <span className="mr-4">Difficulty: {scenario.difficulty}/5</span>
                          <span>{scenario.timeRequired}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors ml-4" />
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Completed Stakeholder Meeting</p>
                    <p className="text-xs text-slate-600">Earned 50 XP • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <Trophy className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Earned "Team Player" Badge</p>
                    <p className="text-xs text-slate-600">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="font-semibold text-slate-800 mb-4">Progress Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Level Progress</span>
                    <span className="font-medium text-slate-800">{player?.experience || 0}/500 XP</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((player?.experience || 0) / 500) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Scenarios Completed</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {completedScenarios.length}/{selectedRole ? getAvailableScenarios(selectedRole.id).length : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Badges Earned</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="bg-gradient-to-br from-blue-50 to-teal-50 p-3 rounded-lg border border-blue-200">
                    <Award className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-xs font-medium text-slate-800">{badge.badge_name}</p>
                  </div>
                ))}
                {badges.length === 0 && (
                  <div className="col-span-2 text-center py-4">
                    <p className="text-sm text-slate-500">Complete scenarios to earn badges!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const GameSetupPage = () => (
    <div className="min-h-screen bg-slate-50">
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
              <h1 className="text-xl font-semibold text-slate-800">Board Meeting Game Setup</h1>
              <p className="text-slate-600 text-sm">Create or join a game session</p>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">
        <GameSessionSetup onSessionReady={handleSessionReady} />
      </div>
    </div>
  );

  const MeetingPage = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentView('game-setup')}
              className="text-slate-600 hover:text-slate-800 mr-4 transition-colors"
            >
              ← Back to Setup
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Board Meeting in Session</h1>
              <p className="text-slate-600 text-sm">Participate in the live board meeting simulation</p>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">
        {currentSession && <BoardMeeting gameSessionId={currentSession.id} />}
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {currentView === 'welcome' && <WelcomePage />}
      {currentView === 'roles' && <RoleSelectionPage />}
      {currentView === 'dashboard' && <DashboardPage />}
      {currentView === 'game-setup' && <GameSetupPage />}
      {currentView === 'meeting' && <MeetingPage />}
    </div>
  );
}

export default App;