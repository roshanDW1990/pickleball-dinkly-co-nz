/*
  # Tournament Groups and Match Results System

  This migration creates the infrastructure for tournament pool/group management and match results tracking.

  ## New Tables

  ### `tournament_groups`
  Groups or pools of players within a tournament (e.g., "Pool A", "Pool B", "Bracket 1")
  - `id` (uuid, primary key)
  - `tournament_id` (uuid, foreign key to tournaments)
  - `name` (text) - Display name like "Pool A", "Bracket 1"
  - `description` (text, optional) - Additional info about the group
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `group_members`
  Players assigned to specific tournament groups
  - `id` (uuid, primary key)
  - `group_id` (uuid, foreign key to tournament_groups)
  - `user_id` (uuid, foreign key to auth.users)
  - `registration_id` (uuid, foreign key to tournament_registrations)
  - `seed_position` (integer, optional) - For seeding/ordering players
  - `created_at` (timestamptz)

  ### `matches`
  Individual matches between players in a tournament
  - `id` (uuid, primary key)
  - `tournament_id` (uuid, foreign key to tournaments)
  - `group_id` (uuid, foreign key to tournament_groups, optional)
  - `player1_id` (uuid, foreign key to auth.users)
  - `player2_id` (uuid, foreign key to auth.users)
  - `round_number` (integer) - Which round (1, 2, 3, etc.)
  - `match_number` (integer) - Match sequence within round
  - `scheduled_time` (timestamptz, optional)
  - `status` (text) - 'scheduled', 'in_progress', 'completed', 'cancelled'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `match_results`
  Results submitted by players for their matches
  - `id` (uuid, primary key)
  - `match_id` (uuid, foreign key to matches)
  - `submitted_by` (uuid, foreign key to auth.users) - Who submitted the result
  - `player1_score` (integer) - Score for player 1
  - `player2_score` (integer) - Score for player 2
  - `winner_id` (uuid, foreign key to auth.users)
  - `status` (text) - 'pending', 'approved', 'rejected', 'disputed'
  - `notes` (text, optional) - Additional notes from submitter
  - `admin_notes` (text, optional) - Notes from admin during review
  - `reviewed_by` (uuid, foreign key to auth.users, optional) - Admin who reviewed
  - `reviewed_at` (timestamptz, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can view their own groups and matches
  - Users can submit results for their own matches
  - Only admins can manage groups and approve results
  - Users can view approved results for matches in their tournament

  ## Important Notes
  1. Each match can have multiple result submissions (if disputed)
  2. Admin approval is required before results are finalized
  3. Groups are flexible - can be pools, brackets, or any organizational structure
  4. Supports round-robin and elimination formats
*/

-- Create tournament_groups table
CREATE TABLE IF NOT EXISTS tournament_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES tournament_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_id uuid NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  seed_position integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  group_id uuid REFERENCES tournament_groups(id) ON DELETE SET NULL,
  player1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  match_number integer NOT NULL DEFAULT 1,
  scheduled_time timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

-- Create match_results table
CREATE TABLE IF NOT EXISTS match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player1_score integer NOT NULL DEFAULT 0 CHECK (player1_score >= 0),
  player2_score integer NOT NULL DEFAULT 0 CHECK (player2_score >= 0),
  winner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disputed')),
  notes text,
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tournament_groups_tournament_id ON tournament_groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_results_match_id ON match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_match_results_status ON match_results(status);

-- Enable RLS
ALTER TABLE tournament_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournament_groups

-- Admins can do everything with groups
CREATE POLICY "Admins can view all tournament groups"
  ON tournament_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert tournament groups"
  ON tournament_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update tournament groups"
  ON tournament_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete tournament groups"
  ON tournament_groups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can view groups they are part of
CREATE POLICY "Users can view their tournament groups"
  ON tournament_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tournament_groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for group_members

-- Admins can manage all group members
CREATE POLICY "Admins can view all group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert group members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update group members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete group members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can view group members in their groups
CREATE POLICY "Users can view members in their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
    )
  );

-- RLS Policies for matches

-- Admins can manage all matches
CREATE POLICY "Admins can view all matches"
  ON matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete matches"
  ON matches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can view their own matches
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (
    auth.uid() = player1_id OR auth.uid() = player2_id
  );

-- RLS Policies for match_results

-- Admins can view all results
CREATE POLICY "Admins can view all match results"
  ON match_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update results (for approval/rejection)
CREATE POLICY "Admins can update match results"
  ON match_results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can submit results for their matches
CREATE POLICY "Users can submit results for their matches"
  ON match_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_results.match_id
      AND (matches.player1_id = auth.uid() OR matches.player2_id = auth.uid())
    )
    AND submitted_by = auth.uid()
  );

-- Users can view results for their matches
CREATE POLICY "Users can view results for their matches"
  ON match_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_results.match_id
      AND (matches.player1_id = auth.uid() OR matches.player2_id = auth.uid())
    )
  );

-- Users can update their own pending submissions
CREATE POLICY "Users can update their pending submissions"
  ON match_results FOR UPDATE
  TO authenticated
  USING (
    submitted_by = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    submitted_by = auth.uid()
    AND status = 'pending'
  );