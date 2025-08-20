/*
  # Board Meeting Simulation System

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text) - 'setup', 'donations', 'meeting', 'completed'
      - `total_donations` (decimal)
      - `prize_pool` (decimal)
      - `created_at` (timestamp)
      - `started_at` (timestamp)
      - `ended_at` (timestamp)

    - `player_donations`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `player_id` (uuid, foreign key)
      - `amount` (decimal)
      - `donated_at` (timestamp)

    - `role_budgets`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `role_id` (text)
      - `allocated_budget` (decimal)
      - `spent_budget` (decimal)

    - `meeting_sessions`
      - `id` (uuid, primary key)
      - `game_session_id` (uuid, foreign key)
      - `current_agenda_item` (smallint)
      - `meeting_minutes` (jsonb)
      - `status` (text) - 'call_to_order', 'minutes_review', 'reports', 'old_business', 'new_business', 'adjournment'

    - `meeting_responses`
      - `id` (uuid, primary key)
      - `meeting_session_id` (uuid, foreign key)
      - `player_id` (uuid, foreign key)
      - `agenda_item` (text)
      - `responses` (jsonb)
      - `points_earned` (smallint)
      - `submitted_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'setup' CHECK (status IN ('setup', 'donations', 'meeting', 'completed')),
  total_donations decimal(10,2) DEFAULT 0.00,
  prize_pool decimal(10,2) DEFAULT 0.00,
  created_by uuid REFERENCES players(id),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Session creators can update their sessions"
  ON game_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Player Donations Table
CREATE TABLE IF NOT EXISTS player_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id),
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  donated_at timestamptz DEFAULT now()
);

ALTER TABLE player_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all donations"
  ON player_donations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own donations"
  ON player_donations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- Role Budgets Table
CREATE TABLE IF NOT EXISTS role_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  role_id text NOT NULL,
  allocated_budget decimal(10,2) DEFAULT 0.00,
  spent_budget decimal(10,2) DEFAULT 0.00
);

ALTER TABLE role_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all role budgets"
  ON role_budgets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update role budgets"
  ON role_budgets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Meeting Sessions Table
CREATE TABLE IF NOT EXISTS meeting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  current_agenda_item smallint DEFAULT 0,
  meeting_minutes jsonb DEFAULT '{}',
  status text DEFAULT 'call_to_order' CHECK (status IN ('call_to_order', 'minutes_review', 'reports', 'old_business', 'new_business', 'adjournment')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all meeting sessions"
  ON meeting_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update meeting sessions"
  ON meeting_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Meeting Responses Table
CREATE TABLE IF NOT EXISTS meeting_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_session_id uuid REFERENCES meeting_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id),
  agenda_item text NOT NULL,
  responses jsonb DEFAULT '{}',
  points_earned smallint DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all meeting responses"
  ON meeting_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own responses"
  ON meeting_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own responses"
  ON meeting_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Session Participants Table (to track who's in each game)
CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id),
  role_id text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, player_id)
);

ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all participants"
  ON session_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join sessions"
  ON session_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);