/*
  # Complete Board Game Governance Schema

  1. New Tables
    - `game_sessions` - Game session management
    - `session_participants` - Players in each session with roles
    - `meeting_minutes_summary` - Secretary's meeting summaries
    - `financial_summary` - Treasurer's financial reports
    - `motions` - New business motions and voting
    - `scenario_questions` - Scenario cards for each role
    - `scenario_answers` - Player answers to scenarios
    - `answer_votes` - Peer voting on scenario answers (1-10 coins)
    - `next_agenda` - Items for next meeting
    - `player_budgets` - Individual player budgets from donations

  2. Updated Tables
    - Enhanced existing tables for the meeting flow
    - Added proper relationships and constraints

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Game Sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'setup' CHECK (status IN ('setup', 'donations', 'meeting', 'voting', 'completed')),
  current_agenda_item text DEFAULT 'call_to_order',
  total_donations numeric(10,2) DEFAULT 0.00,
  prize_pool numeric(10,2) DEFAULT 0.00,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

-- Session Participants with Random Role Assignment
CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id),
  role_name text NOT NULL CHECK (role_name IN (
    'Executive Director',
    'Treasurer', 
    'Secretary',
    'Fundraising Director',
    'Program Director',
    'Project Director',
    'Grant Writer',
    'Tech & App Dev / Marketing-Communications Director'
  )),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, player_id),
  UNIQUE(session_id, role_name)
);

-- Player Donations (open to all players)
CREATE TABLE IF NOT EXISTS player_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  donated_at timestamptz DEFAULT now()
);

-- Player Budgets (split from donations)
CREATE TABLE IF NOT EXISTS player_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id),
  allocated_amount numeric(10,2) DEFAULT 0.00,
  spent_amount numeric(10,2) DEFAULT 0.00,
  updated_at timestamptz DEFAULT now()
);

-- Meeting Minutes Summary (Secretary view)
CREATE TABLE IF NOT EXISTS meeting_minutes_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  secretary_id uuid REFERENCES auth.users(id),
  previous_minutes text,
  current_minutes text,
  minutes_approved boolean DEFAULT false,
  approval_votes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Financial Summary (Treasurer view)
CREATE TABLE IF NOT EXISTS financial_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  treasurer_id uuid REFERENCES auth.users(id),
  total_donations numeric(10,2) DEFAULT 0.00,
  prize_pool numeric(10,2) DEFAULT 0.00,
  budget_per_player numeric(10,2) DEFAULT 0.00,
  budget_approved boolean DEFAULT false,
  budget_challenges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Motions (New Business)
CREATE TABLE IF NOT EXISTS motions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  proposed_by uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text NOT NULL,
  motion_type text DEFAULT 'new_business' CHECK (motion_type IN ('old_business', 'new_business')),
  status text DEFAULT 'proposed' CHECK (status IN ('proposed', 'voting', 'approved', 'rejected', 'tabled')),
  votes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Scenario Questions (Role-specific cards)
CREATE TABLE IF NOT EXISTS scenario_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL,
  question_text text NOT NULL,
  question_type text DEFAULT 'open_ended' CHECK (question_type IN ('multiple_choice', 'open_ended', 'budget_allocation')),
  options jsonb DEFAULT '[]',
  points_possible integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Scenario Answers (Player responses)
CREATE TABLE IF NOT EXISTS scenario_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id),
  question_id uuid REFERENCES scenario_questions(id),
  answer_text text NOT NULL,
  budget_used numeric(10,2) DEFAULT 0.00,
  submitted_at timestamptz DEFAULT now()
);

-- Answer Votes (Peer voting 1-10 coins)
CREATE TABLE IF NOT EXISTS answer_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES scenario_answers(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES auth.users(id),
  coins_awarded integer CHECK (coins_awarded >= 1 AND coins_awarded <= 10),
  feedback text,
  voted_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, voter_id)
);

-- Next Agenda Items
CREATE TABLE IF NOT EXISTS next_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  agenda_items text[] DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Players table (if not exists)
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  name text,
  email text,
  total_coins integer DEFAULT 0,
  games_played integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert sample scenario questions for each role
INSERT INTO scenario_questions (role_name, question_text, question_type, points_possible) VALUES
-- Executive Director
('Executive Director', 'The organization is facing a 30% budget shortfall. How do you prioritize which programs to maintain, reduce, or eliminate?', 'open_ended', 10),
('Executive Director', 'A major donor is threatening to withdraw funding due to disagreement with a recent organizational decision. How do you handle this situation?', 'open_ended', 10),

-- Treasurer
('Treasurer', 'You discover a significant discrepancy in the quarterly financial report just before the board meeting. What is your immediate course of action?', 'open_ended', 10),
('Treasurer', 'The organization has an unexpected surplus of $50,000. Present your recommendation for how these funds should be allocated.', 'budget_allocation', 10),

-- Secretary
('Secretary', 'During a heated board discussion, two members make conflicting statements about a previous decision. How do you handle this in the minutes?', 'open_ended', 10),
('Secretary', 'A board member requests that their dissenting opinion on a controversial vote be recorded in detail. How do you balance transparency with diplomacy?', 'open_ended', 10),

-- Fundraising Director
('Fundraising Director', 'A fundraising gala is coming up next weekend. What creative marketing and advertising strategy would you implement to bring the most potential donors to the event?', 'open_ended', 10),
('Fundraising Director', 'Your largest corporate sponsor has reduced their contribution by 50%. Develop a strategy to diversify funding sources and make up the shortfall.', 'open_ended', 10),

-- Program Director
('Program Director', 'Participant feedback indicates that one of your flagship programs is not meeting expectations. How do you evaluate and improve program effectiveness?', 'open_ended', 10),
('Program Director', 'You have the opportunity to expand into a new program area, but it would require reallocating resources from existing programs. How do you make this decision?', 'open_ended', 10),

-- Project Director
('Project Director', 'Three major projects have overlapping deadlines and competing resource needs. How do you prioritize and manage these competing demands?', 'open_ended', 10),
('Project Director', 'A key project is 30% over budget and behind schedule. Present your plan to get it back on track while maintaining quality standards.', 'budget_allocation', 10),

-- Grant Writer
('Grant Writer', 'You have identified a perfect grant opportunity worth $100,000, but the deadline is in two weeks and requires extensive community partnerships. How do you approach this?', 'open_ended', 10),
('Grant Writer', 'A major grant you wrote was rejected. The funder provided minimal feedback. How do you learn from this and improve future applications?', 'open_ended', 10),

-- Tech & App Dev / Marketing-Communications Director
('Tech & App Dev / Marketing-Communications Director', 'The organization needs to increase its digital presence and engagement with younger demographics. What integrated technology and marketing strategy would you propose?', 'open_ended', 10),
('Tech & App Dev / Marketing-Communications Director', 'A social media crisis has emerged with negative comments about the organization going viral. How do you manage this situation across all digital platforms?', 'open_ended', 10);

-- Enable RLS on all tables
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE motions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Game Sessions - Anyone can read, creators can manage
CREATE POLICY "Anyone can read game sessions" ON game_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create game sessions" ON game_sessions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators can update their sessions" ON game_sessions FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- Session Participants - Anyone can read, users can join
CREATE POLICY "Anyone can read participants" ON session_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join sessions" ON session_participants FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

-- Player Donations - Anyone can read, users can donate
CREATE POLICY "Anyone can read donations" ON player_donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can make donations" ON player_donations FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

-- Player Budgets - Users can read/update their own
CREATE POLICY "Users can read their budgets" ON player_budgets FOR SELECT TO authenticated USING (player_id = auth.uid());
CREATE POLICY "Users can update their budgets" ON player_budgets FOR UPDATE TO authenticated USING (player_id = auth.uid());

-- Meeting Minutes - Anyone can read, secretary can manage
CREATE POLICY "Anyone can read minutes" ON meeting_minutes_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Secretary can manage minutes" ON meeting_minutes_summary FOR ALL TO authenticated USING (secretary_id = auth.uid());

-- Financial Summary - Anyone can read, treasurer can manage
CREATE POLICY "Anyone can read financial summary" ON financial_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Treasurer can manage financial summary" ON financial_summary FOR ALL TO authenticated USING (treasurer_id = auth.uid());

-- Motions - Anyone can read, users can propose
CREATE POLICY "Anyone can read motions" ON motions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can propose motions" ON motions FOR INSERT TO authenticated WITH CHECK (proposed_by = auth.uid());
CREATE POLICY "Proposers can update their motions" ON motions FOR UPDATE TO authenticated USING (proposed_by = auth.uid());

-- Scenario Questions - Anyone can read
CREATE POLICY "Anyone can read scenario questions" ON scenario_questions FOR SELECT TO authenticated USING (true);

-- Scenario Answers - Anyone can read, users can submit their own
CREATE POLICY "Anyone can read scenario answers" ON scenario_answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can submit their answers" ON scenario_answers FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());
CREATE POLICY "Users can update their answers" ON scenario_answers FOR UPDATE TO authenticated USING (player_id = auth.uid());

-- Answer Votes - Anyone can read, users can vote (not on their own)
CREATE POLICY "Anyone can read votes" ON answer_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote on others answers" ON answer_votes 
  FOR INSERT TO authenticated 
  WITH CHECK (
    voter_id = auth.uid() AND 
    voter_id != (SELECT player_id FROM scenario_answers WHERE id = answer_id)
  );

-- Next Agenda - Anyone can read, secretary can update
CREATE POLICY "Anyone can read next agenda" ON next_agenda FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update next agenda" ON next_agenda FOR ALL TO authenticated USING (updated_by = auth.uid());

-- Players - Users can manage their own profile
CREATE POLICY "Users can read all players" ON players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their profile" ON players FOR ALL TO authenticated USING (id = auth.uid());

-- Function to randomly assign roles
CREATE OR REPLACE FUNCTION assign_random_role(p_session_id uuid, p_player_id uuid)
RETURNS text AS $$
DECLARE
  available_roles text[] := ARRAY[
    'Executive Director',
    'Treasurer', 
    'Secretary',
    'Fundraising Director',
    'Program Director',
    'Project Director',
    'Grant Writer',
    'Tech & App Dev / Marketing-Communications Director'
  ];
  taken_roles text[];
  available_role text;
BEGIN
  -- Get already taken roles for this session
  SELECT array_agg(role_name) INTO taken_roles
  FROM session_participants 
  WHERE session_id = p_session_id;
  
  -- Remove taken roles from available roles
  IF taken_roles IS NOT NULL THEN
    available_roles := array(SELECT unnest(available_roles) EXCEPT SELECT unnest(taken_roles));
  END IF;
  
  -- If no roles available, return null
  IF array_length(available_roles, 1) IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Select random available role
  available_role := available_roles[floor(random() * array_length(available_roles, 1) + 1)];
  
  -- Insert participant with assigned role
  INSERT INTO session_participants (session_id, player_id, role_name)
  VALUES (p_session_id, p_player_id, available_role);
  
  RETURN available_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recompute budgets from donations
CREATE OR REPLACE FUNCTION recompute_budgets(p_session_id uuid)
RETURNS void AS $$
DECLARE
  total_donations_amount numeric(10,2);
  prize_pool_amount numeric(10,2);
  budget_per_player numeric(10,2);
  participant_count integer;
BEGIN
  -- Calculate total donations for this session
  SELECT COALESCE(SUM(amount), 0) INTO total_donations_amount
  FROM player_donations 
  WHERE session_id = p_session_id;
  
  -- Calculate prize pool (50% of donations)
  prize_pool_amount := total_donations_amount * 0.5;
  
  -- Get participant count
  SELECT COUNT(*) INTO participant_count
  FROM session_participants 
  WHERE session_id = p_session_id;
  
  -- Calculate budget per player (remaining 50% split equally)
  IF participant_count > 0 THEN
    budget_per_player := (total_donations_amount - prize_pool_amount) / participant_count;
  ELSE
    budget_per_player := 0;
  END IF;
  
  -- Update game session totals
  UPDATE game_sessions 
  SET 
    total_donations = total_donations_amount,
    prize_pool = prize_pool_amount
  WHERE id = p_session_id;
  
  -- Update or insert player budgets
  INSERT INTO player_budgets (session_id, player_id, allocated_amount)
  SELECT p_session_id, player_id, budget_per_player
  FROM session_participants 
  WHERE session_id = p_session_id
  ON CONFLICT (session_id, player_id) 
  DO UPDATE SET 
    allocated_amount = budget_per_player,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recompute budgets when donations change
CREATE OR REPLACE FUNCTION trigger_recompute_budgets()
RETURNS trigger AS $$
BEGIN
  PERFORM recompute_budgets(NEW.session_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recompute_budgets_on_donation
  AFTER INSERT OR UPDATE OR DELETE ON player_donations
  FOR EACH ROW EXECUTE FUNCTION trigger_recompute_budgets();

-- Function to update player total coins from votes
CREATE OR REPLACE FUNCTION update_player_coins()
RETURNS trigger AS $$
DECLARE
  answer_player_id uuid;
BEGIN
  -- Get the player who submitted the answer
  SELECT player_id INTO answer_player_id
  FROM scenario_answers 
  WHERE id = NEW.answer_id;
  
  -- Update player's total coins
  UPDATE players 
  SET total_coins = total_coins + NEW.coins_awarded
  WHERE id = answer_player_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coins_on_vote
  AFTER INSERT ON answer_votes
  FOR EACH ROW EXECUTE FUNCTION update_player_coins();