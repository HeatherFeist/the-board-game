/*
  # Board Game Training Platform Schema

  1. New Tables
    - `players`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `current_role` (text, nullable)
      - `level` (integer, default 1)
      - `experience` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `player_badges`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `badge_name` (text)
      - `earned_at` (timestamp)
    - `completed_scenarios`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `scenario_id` (text)
      - `role_id` (text)
      - `score` (integer, nullable)
      - `completed_at` (timestamp)
    - `scenario_progress`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `scenario_id` (text)
      - `role_id` (text)
      - `current_step` (integer, default 0)
      - `decisions_made` (jsonb, default '{}')
      - `started_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public leaderboard data
*/

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  current_role text,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own data"
  ON players
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can update own data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can insert own data"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Player badges table
CREATE TABLE IF NOT EXISTS player_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  badge_name text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE player_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own badges"
  ON player_badges
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert own badges"
  ON player_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Completed scenarios table
CREATE TABLE IF NOT EXISTS completed_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  scenario_id text NOT NULL,
  role_id text NOT NULL,
  score integer,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE completed_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own completed scenarios"
  ON completed_scenarios
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert own completed scenarios"
  ON completed_scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Scenario progress table
CREATE TABLE IF NOT EXISTS scenario_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  scenario_id text NOT NULL,
  role_id text NOT NULL,
  current_step integer DEFAULT 0,
  decisions_made jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scenario_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own scenario progress"
  ON scenario_progress
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can update own scenario progress"
  ON scenario_progress
  FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Players can insert own scenario progress"
  ON scenario_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_badges_player_id ON player_badges(player_id);
CREATE INDEX IF NOT EXISTS idx_completed_scenarios_player_id ON completed_scenarios(player_id);
CREATE INDEX IF NOT EXISTS idx_scenario_progress_player_id ON scenario_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_scenario_progress_scenario_role ON scenario_progress(scenario_id, role_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_progress_updated_at
  BEFORE UPDATE ON scenario_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();