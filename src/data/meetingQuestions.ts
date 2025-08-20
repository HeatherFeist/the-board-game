interface MeetingQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text' | 'scale' | 'budget';
  options?: string[];
  maxLength?: number;
  roleSpecific?: string[];
}

export const meetingQuestions: Record<string, MeetingQuestion[]> = {
  call_to_order: [
    {
      id: 'attendance_check',
      text: 'As we call this meeting to order, how do you ensure all necessary parties are present and accounted for?',
      type: 'multiple_choice',
      options: [
        'Take verbal roll call of all board members',
        'Check against the official member roster',
        'Verify quorum requirements are met',
        'Confirm all committee chairs are present',
        'All of the above'
      ]
    }
  ],

  minutes_review: [
    {
      id: 'minutes_accuracy',
      text: 'The Secretary presents the previous meeting minutes. What is your primary responsibility in reviewing them?',
      type: 'multiple_choice',
      options: [
        'Verify accuracy of recorded decisions and votes',
        'Check that action items were properly documented',
        'Ensure your contributions were accurately captured',
        'Confirm attendance records are correct',
        'Review for any confidential information that should be redacted'
      ],
      roleSpecific: ['secretary']
    },
    {
      id: 'minutes_concerns',
      text: 'If you notice an inaccuracy in the minutes, what is the appropriate course of action?',
      type: 'multiple_choice',
      options: [
        'Raise the concern immediately during review',
        'Contact the Secretary privately after the meeting',
        'Submit written corrections before the next meeting',
        'Move to amend the minutes with specific corrections',
        'Wait until the next meeting to address it'
      ]
    }
  ],

  reports: [
    {
      id: 'financial_report',
      text: 'As Treasurer, present your financial report. What key metrics do you highlight?',
      type: 'multiple_choice',
      options: [
        'Current cash position and monthly burn rate',
        'Budget vs. actual performance by department',
        'Outstanding receivables and payables',
        'Investment performance and reserve funds',
        'All financial metrics with trend analysis'
      ],
      roleSpecific: ['treasurer']
    },
    {
      id: 'program_outcomes',
      text: 'Program Director, report on this quarter\'s program effectiveness. What data do you present?',
      type: 'multiple_choice',
      options: [
        'Participant enrollment and completion rates',
        'Program outcome measurements and impact data',
        'Cost per participant and program efficiency',
        'Stakeholder feedback and satisfaction scores',
        'Comprehensive dashboard with all key performance indicators'
      ],
      roleSpecific: ['program-director']
    },
    {
      id: 'budget_allocation',
      text: 'Based on the reports, how would you allocate your role\'s budget for maximum organizational impact?',
      type: 'budget',
      roleSpecific: ['executive-director', 'treasurer', 'program-director', 'project-director', 'fundraising-director']
    }
  ],

  old_business: [
    {
      id: 'action_items_review',
      text: 'Reviewing action items from the previous meeting, how do you assess completion and accountability?',
      type: 'multiple_choice',
      options: [
        'Go through each item systematically with responsible parties',
        'Focus only on overdue or incomplete items',
        'Request written status reports before the meeting',
        'Use a tracking system to monitor progress between meetings',
        'Implement a formal accountability framework'
      ]
    },
    {
      id: 'unfinished_business',
      text: 'There\'s an unresolved policy issue from last meeting. How do you move it forward?',
      type: 'text',
      maxLength: 300
    }
  ],

  new_business: [
    {
      id: 'new_initiative_proposal',
      text: 'A new program initiative is proposed requiring significant resources. What\'s your evaluation approach?',
      type: 'multiple_choice',
      options: [
        'Request detailed financial projections and ROI analysis',
        'Assess alignment with organizational mission and strategic plan',
        'Evaluate staff capacity and operational feasibility',
        'Consider market demand and competitive landscape',
        'Comprehensive evaluation including all factors above'
      ]
    },
    {
      id: 'resource_allocation',
      text: 'How would you propose allocating resources for this new initiative from your role\'s perspective?',
      type: 'text',
      maxLength: 400
    },
    {
      id: 'budget_commitment',
      text: 'What portion of your allocated budget would you commit to this new initiative?',
      type: 'budget'
    }
  ],

  adjournment: [
    {
      id: 'meeting_effectiveness',
      text: 'As we prepare to adjourn, how do you rate the effectiveness of this meeting?',
      type: 'scale'
    },
    {
      id: 'action_items_clarity',
      text: 'Are the action items and next steps clearly defined and assigned?',
      type: 'multiple_choice',
      options: [
        'Yes, all items have clear owners and deadlines',
        'Mostly clear, but some items need clarification',
        'Several items lack specific assignments',
        'Action items are vague and need better definition',
        'No clear action items were established'
      ]
    },
    {
      id: 'next_meeting_preparation',
      text: 'What preparation will you do before the next meeting to ensure continued progress?',
      type: 'text',
      maxLength: 250
    }
  ]
};

export const getMeetingQuestions = (agendaItem: string, roleId?: string): MeetingQuestion[] => {
  const questions = meetingQuestions[agendaItem] || [];
  
  if (roleId) {
    return questions.filter(q => 
      !q.roleSpecific || q.roleSpecific.includes(roleId)
    );
  }
  
  return questions.filter(q => !q.roleSpecific);
};