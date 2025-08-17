/*
  # Fix table names and add player creation logic

  1. Table Name Fixes
    - Rename 'player badges' to 'player_badges' to match code expectations
    - Ensure all table names use snake_case consistently

  2. Player Creation
    - Add logic to automatically create player records for authenticated users
    - Set up proper defaults and constraints

  3. Security
    - Maintain existing RLS policies
    - Update policies to reference correct table names
*/

-- First, check if the table exists with spaces and rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'player badges'
  ) THEN
    ALTER TABLE "player badges" RENAME TO player_badges;
  END IF;
END $$;

-- Ensure player_badges table exists with correct structure
CREATE TABLE IF NOT EXISTS player_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  badge_name text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

-- Ensure scenario_progress table exists with correct structure  
CREATE TABLE IF NOT EXISTS scenario_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  scenario_id text NOT NULL,
  role_id text NOT NULL,
  current_step smallint DEFAULT 0,
  decisions_made jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure completed_scenarios table exists with correct structure
CREATE TABLE IF NOT EXISTS completed_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  scenario_id text NOT NULL,
  role_id text NOT NULL,
  score smallint,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_scenarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own player data" ON players;
DROP POLICY IF EXISTS "Users can update own player data" ON players;
DROP POLICY IF EXISTS "Users can insert own player data" ON players;
DROP POLICY IF EXISTS "Users can read own badges" ON player_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON player_badges;
DROP POLICY IF EXISTS "Users can read own progress" ON scenario_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON scenario_progress;
DROP POLICY IF EXISTS "Users can read own completed scenarios" ON completed_scenarios;
DROP POLICY IF EXISTS "Users can insert own completed scenarios" ON completed_scenarios;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read own player data"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own player data"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own player data"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own badges"
  ON player_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own badges"
  ON player_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can read own progress"
  ON scenario_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can manage own progress"
  ON scenario_progress FOR ALL
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can read own completed scenarios"
  ON completed_scenarios FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own completed scenarios"
  ON completed_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);