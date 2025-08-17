/*
  # Add Peer Voting System for Scenario Evaluation

  1. New Tables
    - `scenario_responses`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `scenario_id` (text)
      - `role_id` (text)
      - `responses` (jsonb) - stores all answers to scenario questions
      - `submitted_at` (timestamp)
      - `status` (text) - 'pending', 'voting', 'completed'
    
    - `peer_votes`
      - `id` (uuid, primary key)
      - `response_id` (uuid, foreign key to scenario_responses)
      - `voter_id` (uuid, foreign key to players)
      - `scores` (jsonb) - scores for different criteria
      - `feedback` (text) - optional written feedback
      - `voted_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for voting on others' responses

  3. Updates
    - Modify completed_scenarios to reference scenario_responses
*/

CREATE TABLE IF NOT EXISTS scenario_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  scenario_id text NOT NULL,
  role_id text NOT NULL,
  responses jsonb DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'voting', 'completed'))
);

CREATE TABLE IF NOT EXISTS peer_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES scenario_responses(id) NOT NULL,
  voter_id uuid REFERENCES players(id) NOT NULL,
  scores jsonb DEFAULT '{}'::jsonb,
  feedback text,
  voted_at timestamptz DEFAULT now(),
  UNIQUE(response_id, voter_id)
);

ALTER TABLE scenario_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_votes ENABLE ROW LEVEL SECURITY;

-- Policies for scenario_responses
CREATE POLICY "Users can read all scenario responses"
  ON scenario_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own responses"
  ON scenario_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own pending responses"
  ON scenario_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id AND status = 'pending')
  WITH CHECK (auth.uid() = player_id);

-- Policies for peer_votes
CREATE POLICY "Users can read all votes"
  ON peer_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on others' responses"
  ON peer_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = voter_id AND 
    auth.uid() != (SELECT player_id FROM scenario_responses WHERE id = response_id)
  );

CREATE POLICY "Users can update their own votes"
  ON peer_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = voter_id)
  WITH CHECK (auth.uid() = voter_id);

-- Add response_id to completed_scenarios for linking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'completed_scenarios' AND column_name = 'response_id'
  ) THEN
    ALTER TABLE completed_scenarios ADD COLUMN response_id uuid REFERENCES scenario_responses(id);
  END IF;
END $$;