/*
  # Create tournaments table

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key) - Unique tournament identifier
      - `name` (text) - Tournament name
      - `description` (text) - Tournament description
      - `organizer` (text) - Organization/person organizing the tournament
      - `location` (text) - Tournament location
      - `start_date` (date) - Tournament start date
      - `end_date` (date) - Tournament end date
      - `registration_deadline` (date) - Last date for registration
      - `max_participants` (integer) - Maximum number of participants
      - `current_participants` (integer) - Current number of registered participants
      - `entry_fee` (numeric) - Entry fee amount
      - `prize_pool` (numeric) - Total prize pool
      - `surface` (text) - Court surface type
      - `format` (text) - Tournament format
      - `skill_level` (text) - Required skill level
      - `status` (text) - Tournament status
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
      - `created_by` (uuid) - User who created the tournament
  
  2. Security
    - Enable RLS on `tournaments` table
    - Add policy for public read access (anyone can view tournaments)
    - Add policy for authenticated users to create tournaments (will be admin-only later)
    - Add policy for tournament creators to update/delete their tournaments
*/

CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  organizer text NOT NULL,
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_deadline date NOT NULL,
  max_participants integer NOT NULL DEFAULT 32,
  current_participants integer NOT NULL DEFAULT 0,
  entry_fee numeric(10, 2) NOT NULL DEFAULT 0,
  prize_pool numeric(10, 2) NOT NULL DEFAULT 0,
  surface text NOT NULL DEFAULT 'Hard Court',
  format text NOT NULL DEFAULT 'Single Elimination',
  skill_level text NOT NULL DEFAULT 'Open',
  status text NOT NULL DEFAULT 'Registration',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Anyone can view tournaments
CREATE POLICY "Anyone can view tournaments"
  ON tournaments
  FOR SELECT
  USING (true);

-- Authenticated users can create tournaments
CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own tournaments
CREATE POLICY "Users can update own tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own tournaments
CREATE POLICY "Users can delete own tournaments"
  ON tournaments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS tournaments_status_idx ON tournaments(status);
CREATE INDEX IF NOT EXISTS tournaments_start_date_idx ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS tournaments_created_by_idx ON tournaments(created_by);