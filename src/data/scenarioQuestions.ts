interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text' | 'scale';
  options?: string[];
  maxLength?: number;
}

export const scenarioQuestions: Record<string, Question[]> = {
  'board-meeting-facilitation': [
    {
      id: 'conflict_approach',
      text: 'Two board members are in heated disagreement about budget allocation. What is your immediate approach to de-escalate the situation?',
      type: 'multiple_choice',
      options: [
        'Call for a 10-minute break to let emotions cool down',
        'Redirect the conversation to focus on shared organizational goals',
        'Ask each member to present their position without interruption',
        'Table the discussion for the next meeting',
        'Facilitate a structured debate with time limits for each speaker'
      ]
    },
    {
      id: 'resolution_strategy',
      text: 'Describe your strategy for finding common ground between the conflicting positions while maintaining board unity.',
      type: 'text',
      maxLength: 500
    },
    {
      id: 'meeting_productivity',
      text: 'How important is it to resolve this conflict within the current meeting versus ensuring overall meeting productivity?',
      type: 'scale'
    },
    {
      id: 'follow_up_plan',
      text: 'What follow-up actions would you take after the meeting to ensure the relationship between the board members remains professional?',
      type: 'text',
      maxLength: 300
    }
  ],

  'strategic-pivot': [
    {
      id: 'assessment_approach',
      text: 'Market conditions have changed dramatically. What is your first step in evaluating whether to pivot the organization\'s mission?',
      type: 'multiple_choice',
      options: [
        'Conduct a comprehensive stakeholder survey',
        'Analyze financial projections for both scenarios',
        'Review competitor responses to market changes',
        'Consult with program staff about operational feasibility',
        'Schedule emergency board retreat for strategic planning'
      ]
    },
    {
      id: 'stakeholder_communication',
      text: 'How would you communicate this potential strategic change to key stakeholders while the decision is still being evaluated?',
      type: 'text',
      maxLength: 400
    },
    {
      id: 'risk_tolerance',
      text: 'How comfortable are you with making significant organizational changes based on market pressures?',
      type: 'scale'
    },
    {
      id: 'decision_timeline',
      text: 'Outline your proposed timeline and decision-making process for this strategic evaluation.',
      type: 'text',
      maxLength: 350
    }
  ],

  'stakeholder-crisis': [
    {
      id: 'immediate_response',
      text: 'Your largest donor is threatening to withdraw funding. What is your immediate response strategy?',
      type: 'multiple_choice',
      options: [
        'Schedule an urgent in-person meeting with the donor',
        'Prepare a detailed report addressing their specific concerns',
        'Involve other board members in the conversation',
        'Offer to modify organizational practices to address concerns',
        'Seek to understand the root cause of their dissatisfaction'
      ]
    },
    {
      id: 'relationship_preservation',
      text: 'Describe how you would work to preserve the relationship while staying true to organizational values.',
      type: 'text',
      maxLength: 450
    },
    {
      id: 'compromise_willingness',
      text: 'How willing are you to compromise organizational direction to maintain this major funding source?',
      type: 'scale'
    },
    {
      id: 'contingency_planning',
      text: 'What contingency plans would you develop in case the donor relationship cannot be salvaged?',
      type: 'text',
      maxLength: 300
    }
  ],

  'budget-shortfall': [
    {
      id: 'immediate_action',
      text: 'Revenue is 30% below projections. What is your immediate recommendation to the board?',
      type: 'multiple_choice',
      options: [
        'Implement across-the-board budget cuts of 30%',
        'Prioritize programs and cut the lowest-performing ones',
        'Launch an emergency fundraising campaign',
        'Seek bridge funding or loans to maintain operations',
        'Combine cost-cutting with revenue enhancement strategies'
      ]
    },
    {
      id: 'program_prioritization',
      text: 'Explain your methodology for determining which programs to maintain, modify, or eliminate.',
      type: 'text',
      maxLength: 400
    },
    {
      id: 'transparency_level',
      text: 'How transparent should the organization be with staff and stakeholders about the financial challenges?',
      type: 'scale'
    },
    {
      id: 'recovery_timeline',
      text: 'Outline your proposed timeline and milestones for financial recovery.',
      type: 'text',
      maxLength: 350
    }
  ],

  'annual-budget': [
    {
      id: 'budget_philosophy',
      text: 'When creating the annual budget, what is your primary guiding principle?',
      type: 'multiple_choice',
      options: [
        'Conservative projections with built-in contingencies',
        'Ambitious goals that stretch the organization',
        'Maintaining current service levels with modest growth',
        'Data-driven decisions based on historical performance',
        'Stakeholder input-driven priorities and allocations'
      ]
    },
    {
      id: 'department_conflicts',
      text: 'How would you handle competing budget requests from different departments when resources are limited?',
      type: 'text',
      maxLength: 400
    },
    {
      id: 'growth_vs_stability',
      text: 'How do you balance organizational growth ambitions with financial stability?',
      type: 'scale'
    },
    {
      id: 'monitoring_system',
      text: 'Describe the monitoring and adjustment system you would implement for the annual budget.',
      type: 'text',
      maxLength: 300
    }
  ]
};

// Add more scenario questions for other roles...
export const getQuestionsForScenario = (scenarioId: string): Question[] => {
  return scenarioQuestions[scenarioId] || [];
};