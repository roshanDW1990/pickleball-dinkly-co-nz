-- Create User Profiles Table
-- 
-- 1. New Tables
--    - profiles: Stores user profile information linked to auth.users
--      - id (uuid, primary key) - References auth.users
--      - email (text) - User's email address
--      - first_name (text) - User's first name
--      - last_name (text) - User's last name
--      - username (text, unique) - User's unique username
--      - location (text) - User's location (City, State)
--      - phone_number (text) - User's phone number (optional)
--      - pickleball_level (text) - Pickleball skill level
--      - world_pickleball_number (text) - World Pickleball Number rating (optional)
--      - matches_played (integer) - Total matches played
--      - matches_won (integer) - Total matches won
--      - matches_lost (integer) - Total matches lost
--      - tournaments_won (integer) - Total tournaments won
--      - current_ranking (integer) - Current ranking position
--      - points (integer) - Total points accumulated
--      - created_at (timestamptz) - Account creation timestamp
--      - updated_at (timestamptz) - Last update timestamp
-- 
-- 2. Security
--    - Enable RLS on profiles table
--    - Add policy for users to read their own profile
--    - Add policy for users to update their own profile
--    - Add policy for authenticated users to read other users' public profiles
--    - Add policy for new users to insert their own profile on signup
-- 
-- 3. Important Notes
--    - The id column references auth.users(id) to link profiles with Supabase Auth
--    - Email verification is handled by Supabase Auth built-in functionality

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  username text UNIQUE,
  location text NOT NULL,
  phone_number text,
  pickleball_level text NOT NULL DEFAULT 'Beginner',
  world_pickleball_number text,
  matches_played integer NOT NULL DEFAULT 0,
  matches_won integer NOT NULL DEFAULT 0,
  matches_lost integer NOT NULL DEFAULT 0,
  tournaments_won integer NOT NULL DEFAULT 0,
  current_ranking integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can read other users' public profiles
CREATE POLICY "Authenticated users can read public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
