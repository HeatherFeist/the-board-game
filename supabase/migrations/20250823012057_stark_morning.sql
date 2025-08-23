/*
  # Board Game Governance Schema

  1. New Tables
    - `players` - Player profiles and progress
    - `player_badges` - Achievement badges for players
    - `scenarios` - Role-based scenarios and questions
    - `scenario_responses` - Player answers to scenarios
    - `peer_votes` - Peer validation of responses
    - `meetings` - Board meeting sessions
    - `meeting_reflections` - Player reflections after meetings
    - `donations` - Player monetary contributions
    - `budgets` - Budget allocations by category
    - `prize_pool` - Total prize pool tracking

  2. Security
    - Enable RLS on all user-owned tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public data where appropriate

  3. Functions
    - `recompute_budgets()` - Recalculates budgets from donations
*/

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  score integer DEFAULT 0,
  progress jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own data"
  ON players
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Players can update own data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Players can insert own data"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Player badges table
CREATE TABLE IF NOT EXISTS player_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  badge text NOT NULL,
  awarded_at timestamptz DEFAULT now()
);

ALTER TABLE player_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own badges"
  ON player_badges
  FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

CREATE POLICY "Players can insert own badges"
  ON player_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

-- Scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text,
  meeting_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scenarios"
  ON scenarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Scenario responses table
CREATE TABLE IF NOT EXISTS scenario_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  scenario_id uuid REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  answer text NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scenario_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read all responses for voting"
  ON scenario_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert own responses"
  ON scenario_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

CREATE POLICY "Players can update own responses"
  ON scenario_responses
  FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

-- Peer votes table
CREATE TABLE IF NOT EXISTS peer_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  response_id uuid REFERENCES scenario_responses(id) ON DELETE CASCADE NOT NULL,
  score integer CHECK (score >= 1 AND score <= 5) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(voter_id, response_id)
);

ALTER TABLE peer_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read all votes"
  ON peer_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert own votes"
  ON peer_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (voter_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

CREATE POLICY "Players can update own votes"
  ON peer_votes
  FOR UPDATE
  TO authenticated
  USING (voter_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  agenda jsonb DEFAULT '[]',
  minutes jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update meetings"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Meeting reflections table
CREATE TABLE IF NOT EXISTS meeting_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  reflection_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, meeting_id)
);

ALTER TABLE meeting_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read all reflections"
  ON meeting_reflections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert own reflections"
  ON meeting_reflections
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

CREATE POLICY "Players can update own reflections"
  ON meeting_reflections
  FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) CHECK (amount > 0) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read all donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert own donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_id = auth.uid()));

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount numeric(10,2) DEFAULT 0,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (true);

-- Prize pool table
CREATE TABLE IF NOT EXISTS prize_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount numeric(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prize pool"
  ON prize_pool
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update prize pool"
  ON prize_pool
  FOR UPDATE
  TO authenticated
  USING (true);

-- Initialize prize pool if it doesn't exist
INSERT INTO prize_pool (total_amount) 
SELECT 0 
WHERE NOT EXISTS (SELECT 1 FROM prize_pool);

-- Function to recompute budgets from donations
CREATE OR REPLACE FUNCTION recompute_budgets()
RETURNS void AS $$
DECLARE
  total_donations numeric(10,2);
  prize_amount numeric(10,2);
  budget_amount numeric(10,2);
  role_budget numeric(10,2);
BEGIN
  -- Calculate total donations
  SELECT COALESCE(SUM(amount), 0) INTO total_donations FROM donations;
  
  -- 50% goes to prize pool
  prize_amount := total_donations * 0.5;
  
  -- 50% goes to budgets, split among 8 roles
  budget_amount := total_donations * 0.5;
  role_budget := budget_amount / 8;
  
  -- Update prize pool
  UPDATE prize_pool SET 
    total_amount = prize_amount,
    updated_at = now();
  
  -- Clear existing budgets
  DELETE FROM budgets;
  
  -- Insert role budgets
  INSERT INTO budgets (category, amount) VALUES
    ('Executive Director', role_budget),
    ('Treasurer', role_budget),
    ('Secretary', role_budget),
    ('Fundraising Director', role_budget),
    ('Program Director', role_budget),
    ('Project Director', role_budget),
    ('Grant Writer', role_budget),
    ('Tech & App Dev / Marketing-Communications Director', role_budget);
END;
$$ LANGUAGE plpgsql;

-- Trigger to recompute budgets when donations change
CREATE OR REPLACE FUNCTION trigger_recompute_budgets()
RETURNS trigger AS $$
BEGIN
  PERFORM recompute_budgets();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donations_changed
  AFTER INSERT OR UPDATE OR DELETE ON donations
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_recompute_budgets();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prize_pool_updated_at
  BEFORE UPDATE ON prize_pool
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_auth_id ON players(auth_id);
CREATE INDEX IF NOT EXISTS idx_player_badges_player_id ON player_badges(player_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_role ON scenarios(role);
CREATE INDEX IF NOT EXISTS idx_scenario_responses_player_id ON scenario_responses(player_id);
CREATE INDEX IF NOT EXISTS idx_scenario_responses_scenario_id ON scenario_responses(scenario_id);
CREATE INDEX IF NOT EXISTS idx_peer_votes_voter_id ON peer_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_peer_votes_response_id ON peer_votes(response_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reflections_player_id ON meeting_reflections(player_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reflections_meeting_id ON meeting_reflections(meeting_id);
CREATE INDEX IF NOT EXISTS idx_donations_player_id ON donations(player_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- Insert sample scenarios for each role
INSERT INTO scenarios (role, question, options, correct_answer) VALUES
('Executive Director', 'How do you set organizational priorities?', 
 '["A) Based on board member preferences", "B) Through stakeholder input and strategic planning", "C) Following industry trends", "D) Based on available funding"]', 
 'B) Through stakeholder input and strategic planning'),

('Treasurer', 'How do you present a budget report?', 
 '["A) Show only the bottom line", "B) Present detailed line items with variance analysis", "C) Focus on expenses only", "D) Provide high-level summaries only"]', 
 'B) Present detailed line items with variance analysis'),

('Secretary', 'What belongs in official minutes?', 
 '["A) Every word spoken", "B) Key decisions, action items, and votes", "C) Personal opinions", "D) Detailed discussions only"]', 
 'B) Key decisions, action items, and votes'),

('Fundraising Director', 'What is the best way to diversify funding sources?', 
 '["A) Focus on one major donor", "B) Mix of grants, individual donors, and earned revenue", "C) Only apply for government grants", "D) Rely on fundraising events only"]', 
 'B) Mix of grants, individual donors, and earned revenue'),

('Program Director', 'How do you evaluate program impact?', 
 '["A) Count participants only", "B) Use outcome metrics and participant feedback", "C) Measure staff satisfaction", "D) Track budget compliance only"]', 
 'B) Use outcome metrics and participant feedback'),

('Project Director', 'How do you manage overlapping project deadlines?', 
 '["A) Work on all projects simultaneously", "B) Prioritize based on impact and resources", "C) Extend all deadlines", "D) Focus on the easiest projects first"]', 
 'B) Prioritize based on impact and resources'),

('Grant Writer', 'What is the most important part of a grant proposal?', 
 '["A) The budget section", "B) Alignment with funder priorities and clear outcomes", "C) The organization history", "D) The appendices"]', 
 'B) Alignment with funder priorities and clear outcomes'),

('Tech & App Dev / Marketing-Communications Director', 'How do you use technology and outreach to support the mission?', 
 '["A) Focus only on social media", "B) Integrate technology with strategic communications", "C) Use the latest tech trends", "D) Prioritize website design only"]', 
 'B) Integrate technology with strategic communications');