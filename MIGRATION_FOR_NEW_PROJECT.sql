/*
  # Complete Schema Migration for Pickleball Community Platform

  This script creates the entire database schema for the Pickleball Community Platform
  on a fresh Supabase project. Run this in the SQL Editor of your Pickleball Project.

  ## Tables Created
  1. profiles - User profiles linked to auth.users
  2. tournaments - Tournament definitions
  3. tournament_registrations - User registrations for tournaments (with Stripe integration)
  4. tournament_groups - Groups/pools within tournaments
  5. group_members - Players assigned to groups
  6. matches - Individual matches between players
  7. match_results - Results submitted for matches (pickleball scoring with sets)
  8. nz_locations - New Zealand locations reference data

  ## Security
  - RLS enabled on ALL tables
  - Comprehensive policies for authenticated users, admins, and public access
  - Admin checks via profiles.is_admin field

  ## Extensions
  - pg_net (async HTTP for welcome emails)

  ## Functions & Triggers
  - update_updated_at_column (auto-update timestamps)
  - update_tournament_registrations_updated_at
  - send_welcome_email_trigger (fires on new profile creation)
*/

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  username text UNIQUE,
  location text NOT NULL,
  phone_number text,
  pickleball_level text NOT NULL DEFAULT 'Beginner',
  dupr_rating text,
  matches_played integer NOT NULL DEFAULT 0,
  matches_won integer NOT NULL DEFAULT 0,
  matches_lost integer NOT NULL DEFAULT 0,
  tournaments_won integer NOT NULL DEFAULT 0,
  current_ranking integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: tournaments
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  organizer text DEFAULT '',
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  registration_deadline date NOT NULL,
  max_participants integer DEFAULT 32,
  current_participants integer DEFAULT 0,
  entry_fee numeric NOT NULL DEFAULT 0,
  prize_pool numeric DEFAULT 0,
  surface text DEFAULT '',
  format text NOT NULL DEFAULT 'Single Elimination',
  skill_level text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS tournaments_status_idx ON tournaments(status);
CREATE INDEX IF NOT EXISTS tournaments_start_date_idx ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS tournaments_created_by_idx ON tournaments(created_by);
CREATE INDEX IF NOT EXISTS tournaments_archived_idx ON tournaments(archived);

-- ============================================================
-- TABLE: tournament_registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  registered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_user_id ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_checkout_session ON tournament_registrations(stripe_checkout_session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_registrations_unique ON tournament_registrations(user_id, tournament_id);

-- ============================================================
-- TABLE: tournament_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tournament_groups ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tournament_groups_tournament_id ON tournament_groups(tournament_id);

-- ============================================================
-- TABLE: group_members
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES tournament_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_id uuid NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  seed_position integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- ============================================================
-- TABLE: matches
-- ============================================================
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
  result_submitted boolean DEFAULT false,
  result_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

-- Foreign keys to profiles for Supabase joins
ALTER TABLE matches
  ADD CONSTRAINT matches_player1_id_profiles_fkey
  FOREIGN KEY (player1_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE matches
  ADD CONSTRAINT matches_player2_id_profiles_fkey
  FOREIGN KEY (player2_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ============================================================
-- TABLE: match_results
-- ============================================================
CREATE TABLE IF NOT EXISTS match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  player1_score integer NOT NULL DEFAULT 0 CHECK (player1_score >= 0),
  player2_score integer NOT NULL DEFAULT 0 CHECK (player2_score >= 0),
  winner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disputed')),
  notes text,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  player1_set1_score integer,
  player1_set2_score integer,
  player1_set3_score integer,
  player2_set1_score integer,
  player2_set2_score integer,
  player2_set3_score integer,
  location text,
  comments text,
  date_completed date DEFAULT CURRENT_DATE
);

-- Foreign keys to profiles for Supabase joins
ALTER TABLE match_results
  ADD CONSTRAINT match_results_submitted_by_fkey
  FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE match_results
  ADD CONSTRAINT match_results_winner_id_fkey
  FOREIGN KEY (winner_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE match_results
  ADD CONSTRAINT match_results_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_match_results_match_id ON match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_match_results_status ON match_results(status);

-- ============================================================
-- TABLE: nz_locations
-- ============================================================
CREATE TABLE IF NOT EXISTS nz_locations (
  id serial PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL,
  type text NOT NULL DEFAULT 'town'
);

ALTER TABLE nz_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS nz_locations_name_idx ON nz_locations USING btree (name text_pattern_ops);
CREATE UNIQUE INDEX IF NOT EXISTS nz_locations_name_region_unique ON nz_locations(name, region);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update tournament_registrations updated_at
CREATE OR REPLACE FUNCTION update_tournament_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Welcome email trigger function (sends async HTTP to edge function)
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT INTO request_id net.http_post(
    url := 'https://zebmqaffhnnuqfzcqkjq.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'firstName', COALESCE(NEW.first_name, 'Player'),
      'lastName', COALESCE(NEW.last_name, '')
    )
  );
  RAISE LOG 'Welcome email request queued with ID: %', request_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to queue welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tournament_registrations_updated_at
  BEFORE UPDATE ON tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_registrations_updated_at();

CREATE TRIGGER on_profile_created_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_trigger();

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can read public profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT TO anon
  USING (true);

-- ============================================================
-- RLS POLICIES: tournaments
-- ============================================================

CREATE POLICY "Public can view active tournaments"
  ON tournaments FOR SELECT TO anon
  USING (status IN ('Approved', 'Ongoing') AND archived = false);

CREATE POLICY "Authenticated users can view all tournaments"
  ON tournaments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tournaments"
  ON tournaments FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own tournaments"
  ON tournaments FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================
-- RLS POLICIES: tournament_registrations
-- ============================================================

CREATE POLICY "Users can view own registrations"
  ON tournament_registrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations"
  ON tournament_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending registrations"
  ON tournament_registrations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND payment_status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON tournament_registrations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================
-- RLS POLICIES: tournament_groups
-- ============================================================

CREATE POLICY "Admins can view all tournament groups"
  ON tournament_groups FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can insert tournament groups"
  ON tournament_groups FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update tournament groups"
  ON tournament_groups FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can delete tournament groups"
  ON tournament_groups FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Users can view their tournament groups"
  ON tournament_groups FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = tournament_groups.id AND group_members.user_id = auth.uid()));

CREATE POLICY "Authenticated users can view all tournament groups"
  ON tournament_groups FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can view tournament groups"
  ON tournament_groups FOR SELECT TO anon
  USING (true);

-- ============================================================
-- RLS POLICIES: group_members
-- ============================================================

CREATE POLICY "Admins can view all group members"
  ON group_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can insert group members"
  ON group_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update group members"
  ON group_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can delete group members"
  ON group_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Authenticated users can view all group members"
  ON group_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can view group members"
  ON group_members FOR SELECT TO anon
  USING (true);

-- ============================================================
-- RLS POLICIES: matches
-- ============================================================

CREATE POLICY "Admins can view all matches"
  ON matches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can insert matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update matches"
  ON matches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can delete matches"
  ON matches FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Authenticated users can view all matches"
  ON matches FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can view matches"
  ON matches FOR SELECT TO anon
  USING (true);

-- ============================================================
-- RLS POLICIES: match_results
-- ============================================================

CREATE POLICY "Admins can view all match results"
  ON match_results FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update match results"
  ON match_results FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Users can submit results for their matches"
  ON match_results FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_results.match_id
      AND (matches.player1_id = auth.uid() OR matches.player2_id = auth.uid())
    )
    AND submitted_by = auth.uid()
  );

CREATE POLICY "Users can view results for their matches"
  ON match_results FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_results.match_id
      AND (matches.player1_id = auth.uid() OR matches.player2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their pending submissions"
  ON match_results FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');

CREATE POLICY "Authenticated users can view all approved match results"
  ON match_results FOR SELECT TO authenticated
  USING (status = 'approved');

CREATE POLICY "Public can view match results"
  ON match_results FOR SELECT TO anon
  USING (true);

-- ============================================================
-- RLS POLICIES: nz_locations
-- ============================================================

CREATE POLICY "Public can read nz_locations"
  ON nz_locations FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- NZ LOCATIONS DATA (454 rows)
-- ============================================================
INSERT INTO nz_locations (name, region, type) VALUES
('Albany', 'Auckland', 'suburb'),
('Arch Hill', 'Auckland', 'suburb'),
('Auckland', 'Auckland', 'city'),
('Avondale', 'Auckland', 'suburb'),
('Balmoral', 'Auckland', 'suburb'),
('Beach Haven', 'Auckland', 'suburb'),
('Beachlands', 'Auckland', 'town'),
('Birkdale', 'Auckland', 'suburb'),
('Birkenhead', 'Auckland', 'suburb'),
('Blockhouse Bay', 'Auckland', 'suburb'),
('Botany Downs', 'Auckland', 'suburb'),
('Browns Bay', 'Auckland', 'suburb'),
('Campbells Bay', 'Auckland', 'suburb'),
('Castor Bay', 'Auckland', 'suburb'),
('Clendon Park', 'Auckland', 'suburb'),
('Clevedon', 'Auckland', 'town'),
('Clover Park', 'Auckland', 'suburb'),
('Conifer Grove', 'Auckland', 'suburb'),
('Devonport', 'Auckland', 'suburb'),
('Eden Terrace', 'Auckland', 'suburb'),
('Ellerslie', 'Auckland', 'suburb'),
('Epsom', 'Auckland', 'suburb'),
('Favona', 'Auckland', 'suburb'),
('Flat Bush', 'Auckland', 'suburb'),
('Forrest Hill', 'Auckland', 'suburb'),
('Freeman''s Bay', 'Auckland', 'suburb'),
('Glen Eden', 'Auckland', 'suburb'),
('Glen Innes', 'Auckland', 'suburb'),
('Glendene', 'Auckland', 'suburb'),
('Glenfield', 'Auckland', 'suburb'),
('Goodwood Heights', 'Auckland', 'suburb'),
('Grafton', 'Auckland', 'suburb'),
('Green Bay', 'Auckland', 'suburb'),
('Greenlane', 'Auckland', 'suburb'),
('Grey Lynn', 'Auckland', 'suburb'),
('Helensville', 'Auckland', 'town'),
('Henderson', 'Auckland', 'suburb'),
('Herne Bay', 'Auckland', 'suburb'),
('Hillcrest', 'Auckland', 'suburb'),
('Hillsborough', 'Auckland', 'suburb'),
('Howick', 'Auckland', 'suburb'),
('Karaka', 'Auckland', 'suburb'),
('Kelston', 'Auckland', 'suburb'),
('Kingsland', 'Auckland', 'suburb'),
('Kohimarama', 'Auckland', 'suburb'),
('Kumeu', 'Auckland', 'town'),
('Long Bay', 'Auckland', 'suburb'),
('Lynfield', 'Auckland', 'suburb'),
('Mairangi Bay', 'Auckland', 'suburb'),
('Mangere', 'Auckland', 'suburb'),
('Mangere Bridge', 'Auckland', 'suburb'),
('Manukau', 'Auckland', 'city'),
('Manurewa', 'Auckland', 'suburb'),
('Massey', 'Auckland', 'suburb'),
('Meadowbank', 'Auckland', 'suburb'),
('Milford', 'Auckland', 'suburb'),
('Mission Bay', 'Auckland', 'suburb'),
('Morningside', 'Auckland', 'suburb'),
('Mount Albert', 'Auckland', 'suburb'),
('Mt Eden', 'Auckland', 'suburb'),
('Mt Roskill', 'Auckland', 'suburb'),
('Murrays Bay', 'Auckland', 'suburb'),
('New Lynn', 'Auckland', 'suburb'),
('Newmarket', 'Auckland', 'suburb'),
('North Shore', 'Auckland', 'city'),
('Northcote', 'Auckland', 'suburb'),
('Onehunga', 'Auckland', 'suburb'),
('Orakei', 'Auckland', 'suburb'),
('Orewa', 'Auckland', 'town'),
('Otahuhu', 'Auckland', 'suburb'),
('Otara', 'Auckland', 'suburb'),
('Pakuranga', 'Auckland', 'suburb'),
('Panmure', 'Auckland', 'suburb'),
('Papakura', 'Auckland', 'town'),
('Papatoetoe', 'Auckland', 'suburb'),
('Parnell', 'Auckland', 'suburb'),
('Penrose', 'Auckland', 'suburb'),
('Pinehill', 'Auckland', 'suburb'),
('Point Chevalier', 'Auckland', 'suburb'),
('Point England', 'Auckland', 'suburb'),
('Ponsonby', 'Auckland', 'suburb'),
('Pukekohe', 'Auckland', 'town'),
('Randwick Park', 'Auckland', 'suburb'),
('Ranui', 'Auckland', 'suburb'),
('Red Beach', 'Auckland', 'town'),
('Remuera', 'Auckland', 'suburb'),
('Rosedale', 'Auckland', 'suburb'),
('Rothesay Bay', 'Auckland', 'suburb'),
('Royal Heights', 'Auckland', 'suburb'),
('Royal Oak', 'Auckland', 'suburb'),
('Sandringham', 'Auckland', 'suburb'),
('Silverdale', 'Auckland', 'town'),
('St Heliers', 'Auckland', 'suburb'),
('St Johns', 'Auckland', 'suburb'),
('St Marys Bay', 'Auckland', 'suburb'),
('Sunnynook', 'Auckland', 'suburb'),
('Sunnyvale', 'Auckland', 'suburb'),
('Swanson', 'Auckland', 'suburb'),
('Takanini', 'Auckland', 'suburb'),
('Takapuna', 'Auckland', 'suburb'),
('Te Atatu Peninsula', 'Auckland', 'suburb'),
('Te Atatu South', 'Auckland', 'suburb'),
('Three Kings', 'Auckland', 'suburb'),
('Titirangi', 'Auckland', 'suburb'),
('Torbay', 'Auckland', 'suburb'),
('Totara Vale', 'Auckland', 'suburb'),
('Unsworth Heights', 'Auckland', 'suburb'),
('Waiheke Island', 'Auckland', 'town'),
('Wairau Valley', 'Auckland', 'suburb'),
('Waitakere', 'Auckland', 'city'),
('Warkworth', 'Auckland', 'town'),
('Waterview', 'Auckland', 'suburb'),
('Western Springs', 'Auckland', 'suburb'),
('Westgate', 'Auckland', 'suburb'),
('Weymouth', 'Auckland', 'suburb'),
('Whangaparaoa', 'Auckland', 'town'),
('Windsor Park', 'Auckland', 'suburb'),
('Wiri', 'Auckland', 'suburb'),
('Arataki', 'Bay of Plenty', 'suburb'),
('Bellevue', 'Bay of Plenty', 'suburb'),
('Bethlehem', 'Bay of Plenty', 'suburb'),
('Brookfield', 'Bay of Plenty', 'suburb'),
('Edgecumbe', 'Bay of Plenty', 'town'),
('Fairy Springs', 'Bay of Plenty', 'suburb'),
('Fordlands', 'Bay of Plenty', 'suburb'),
('Gate Pa', 'Bay of Plenty', 'suburb'),
('Glenholme', 'Bay of Plenty', 'suburb'),
('Greerton', 'Bay of Plenty', 'suburb'),
('Hairini', 'Bay of Plenty', 'suburb'),
('Holdens Bay', 'Bay of Plenty', 'suburb'),
('Judea', 'Bay of Plenty', 'suburb'),
('Katikati', 'Bay of Plenty', 'town'),
('Kawerau', 'Bay of Plenty', 'town'),
('Koutu', 'Bay of Plenty', 'suburb'),
('Lynmore', 'Bay of Plenty', 'suburb'),
('Matua', 'Bay of Plenty', 'suburb'),
('Mount Maunganui', 'Bay of Plenty', 'suburb'),
('Murupara', 'Bay of Plenty', 'town'),
('Ngongotaha', 'Bay of Plenty', 'suburb'),
('Ohauiti', 'Bay of Plenty', 'suburb'),
('Opotiki', 'Bay of Plenty', 'town'),
('Otumoetai', 'Bay of Plenty', 'suburb'),
('Owhata', 'Bay of Plenty', 'suburb'),
('Papamoa', 'Bay of Plenty', 'suburb'),
('Parkvale', 'Bay of Plenty', 'suburb'),
('Pyes Pa', 'Bay of Plenty', 'suburb'),
('Rotorua', 'Bay of Plenty', 'city'),
('Tauranga', 'Bay of Plenty', 'city'),
('Te Puke', 'Bay of Plenty', 'town'),
('Welcome Bay', 'Bay of Plenty', 'suburb'),
('Whakatane', 'Bay of Plenty', 'town'),
('Addington', 'Canterbury', 'suburb'),
('Amberley', 'Canterbury', 'town'),
('Aranui', 'Canterbury', 'suburb'),
('Ashburton', 'Canterbury', 'city'),
('Avonhead', 'Canterbury', 'suburb'),
('Bexley', 'Canterbury', 'suburb'),
('Bromley', 'Canterbury', 'suburb'),
('Burnside', 'Canterbury', 'suburb'),
('Cashmere', 'Canterbury', 'suburb'),
('Christchurch', 'Canterbury', 'city'),
('Darfield', 'Canterbury', 'town'),
('Edgeware', 'Canterbury', 'suburb'),
('Fendalton', 'Canterbury', 'suburb'),
('Geraldine', 'Canterbury', 'town'),
('Halswell', 'Canterbury', 'suburb'),
('Hanmer Springs', 'Canterbury', 'town'),
('Harewood', 'Canterbury', 'suburb'),
('Hornby', 'Canterbury', 'suburb'),
('Ilam', 'Canterbury', 'suburb'),
('Islington', 'Canterbury', 'suburb'),
('Kaiapoi', 'Canterbury', 'town'),
('Kaikoura', 'Canterbury', 'town'),
('Lincoln', 'Canterbury', 'town'),
('Linwood', 'Canterbury', 'suburb'),
('Lyttelton', 'Canterbury', 'suburb'),
('Mairehau', 'Canterbury', 'suburb'),
('Merivale', 'Canterbury', 'suburb'),
('Methven', 'Canterbury', 'town'),
('New Brighton', 'Canterbury', 'suburb'),
('Northwood', 'Canterbury', 'suburb'),
('Oxford', 'Canterbury', 'town'),
('Papanui', 'Canterbury', 'suburb'),
('Parklands', 'Canterbury', 'suburb'),
('Phillipstown', 'Canterbury', 'suburb'),
('Pleasant Point', 'Canterbury', 'town'),
('Rangiora', 'Canterbury', 'town'),
('Redwood', 'Canterbury', 'suburb'),
('Riccarton', 'Canterbury', 'suburb'),
('Rolleston', 'Canterbury', 'town'),
('Russley', 'Canterbury', 'suburb'),
('Shirley', 'Canterbury', 'suburb'),
('Sockburn', 'Canterbury', 'suburb'),
('Spreydon', 'Canterbury', 'suburb'),
('St Albans', 'Canterbury', 'suburb'),
('Sumner', 'Canterbury', 'suburb'),
('Sydenham', 'Canterbury', 'suburb'),
('Templeton', 'Canterbury', 'suburb'),
('Temuka', 'Canterbury', 'town'),
('Timaru', 'Canterbury', 'city'),
('Upper Riccarton', 'Canterbury', 'suburb'),
('Wainoni', 'Canterbury', 'suburb'),
('Wigram', 'Canterbury', 'suburb'),
('Woolston', 'Canterbury', 'suburb'),
('Yaldhurst', 'Canterbury', 'suburb'),
('Gisborne', 'Gisborne', 'city'),
('Ruatoria', 'Gisborne', 'town'),
('Tokomaru Bay', 'Gisborne', 'town'),
('Tolaga Bay', 'Gisborne', 'town'),
('Camberley', 'Hawke''s Bay', 'suburb'),
('Clive', 'Hawke''s Bay', 'suburb'),
('Flaxmere', 'Hawke''s Bay', 'suburb'),
('Greenmeadows', 'Hawke''s Bay', 'suburb'),
('Hastings', 'Hawke''s Bay', 'city'),
('Havelock North', 'Hawke''s Bay', 'town'),
('Mahora', 'Hawke''s Bay', 'suburb'),
('Maraenui', 'Hawke''s Bay', 'suburb'),
('Marewa', 'Hawke''s Bay', 'suburb'),
('Napier', 'Hawke''s Bay', 'city'),
('Onekawa', 'Hawke''s Bay', 'suburb'),
('Pirimai', 'Hawke''s Bay', 'suburb'),
('Taradale', 'Hawke''s Bay', 'suburb'),
('Waipawa', 'Hawke''s Bay', 'town'),
('Waipukurau', 'Hawke''s Bay', 'town'),
('Wairoa', 'Hawke''s Bay', 'town'),
('Awapuni', 'Manawatu-Whanganui', 'suburb'),
('Bulls', 'Manawatu-Whanganui', 'town'),
('Cloverlea', 'Manawatu-Whanganui', 'suburb'),
('Dannevirke', 'Manawatu-Whanganui', 'town'),
('Feilding', 'Manawatu-Whanganui', 'town'),
('Fitzherbert', 'Manawatu-Whanganui', 'suburb'),
('Foxton', 'Manawatu-Whanganui', 'town'),
('Highbury', 'Manawatu-Whanganui', 'suburb'),
('Hokowhitu', 'Manawatu-Whanganui', 'suburb'),
('Kelvin Grove', 'Manawatu-Whanganui', 'suburb'),
('Levin', 'Manawatu-Whanganui', 'town'),
('Marton', 'Manawatu-Whanganui', 'town'),
('Milson', 'Manawatu-Whanganui', 'suburb'),
('Ohakune', 'Manawatu-Whanganui', 'town'),
('Pahiatua', 'Manawatu-Whanganui', 'town'),
('Palmerston North', 'Manawatu-Whanganui', 'city'),
('Taihape', 'Manawatu-Whanganui', 'town'),
('Takaro', 'Manawatu-Whanganui', 'suburb'),
('Taumarunui', 'Manawatu-Whanganui', 'town'),
('Terrace End', 'Manawatu-Whanganui', 'suburb'),
('Whanganui', 'Manawatu-Whanganui', 'city'),
('Woodville', 'Manawatu-Whanganui', 'town'),
('Blenheim', 'Marlborough', 'city'),
('Havelock', 'Marlborough', 'town'),
('Picton', 'Marlborough', 'town'),
('Renwick', 'Marlborough', 'town'),
('Seddon', 'Marlborough', 'town'),
('Atawhai', 'Nelson', 'suburb'),
('Bishopdale', 'Nelson', 'suburb'),
('Brightwater', 'Nelson', 'town'),
('Enner Glynn', 'Nelson', 'suburb'),
('Nelson', 'Nelson', 'city'),
('Stoke', 'Nelson', 'suburb'),
('Tahunanui', 'Nelson', 'suburb'),
('The Wood', 'Nelson', 'suburb'),
('Toi Toi', 'Nelson', 'suburb'),
('Dargaville', 'Northland', 'town'),
('Hikurangi', 'Northland', 'town'),
('Kaikohe', 'Northland', 'town'),
('Kaitaia', 'Northland', 'town'),
('Kawakawa', 'Northland', 'town'),
('Kerikeri', 'Northland', 'town'),
('Mangawhai', 'Northland', 'town'),
('Maungaturoto', 'Northland', 'town'),
('Ngunguru', 'Northland', 'town'),
('Paihia', 'Northland', 'town'),
('Rawene', 'Northland', 'town'),
('Ruakaka', 'Northland', 'town'),
('Russell', 'Northland', 'town'),
('Waipu', 'Northland', 'town'),
('Whangarei', 'Northland', 'city'),
('Abbotsford', 'Otago', 'suburb'),
('Alexandra', 'Otago', 'town'),
('Andersons Bay', 'Otago', 'suburb'),
('Arrowtown', 'Otago', 'town'),
('Brockville', 'Otago', 'suburb'),
('Caversham', 'Otago', 'suburb'),
('Clyde', 'Otago', 'town'),
('Corstorphine', 'Otago', 'suburb'),
('Cromwell', 'Otago', 'town'),
('Dunedin', 'Otago', 'city'),
('Glenleith', 'Otago', 'suburb'),
('Green Island', 'Otago', 'suburb'),
('Halfway Bush', 'Otago', 'suburb'),
('Helensburgh', 'Otago', 'suburb'),
('Kenmure', 'Otago', 'suburb'),
('Lawrence', 'Otago', 'town'),
('Maori Hill', 'Otago', 'suburb'),
('Milton', 'Otago', 'town'),
('Mornington', 'Otago', 'suburb'),
('Mosgiel', 'Otago', 'suburb'),
('Musselburgh', 'Otago', 'suburb'),
('Oamaru', 'Otago', 'city'),
('Palmerston', 'Otago', 'town'),
('Pine Hill', 'Otago', 'suburb'),
('Port Chalmers', 'Otago', 'suburb'),
('Queenstown', 'Otago', 'city'),
('Ranfurly', 'Otago', 'town'),
('Roslyn', 'Otago', 'suburb'),
('Roxburgh', 'Otago', 'town'),
('South Dunedin', 'Otago', 'suburb'),
('St Clair', 'Otago', 'suburb'),
('St Kilda', 'Otago', 'suburb'),
('Wakari', 'Otago', 'suburb'),
('Wanaka', 'Otago', 'town'),
('Bluff', 'Southland', 'town'),
('Georgetown', 'Southland', 'suburb'),
('Gladstone', 'Southland', 'suburb'),
('Gore', 'Southland', 'town'),
('Grasmere', 'Southland', 'suburb'),
('Invercargill', 'Southland', 'city'),
('Kingswell', 'Southland', 'suburb'),
('Lumsden', 'Southland', 'town'),
('Newfield', 'Southland', 'suburb'),
('Otautau', 'Southland', 'town'),
('Riverton', 'Southland', 'town'),
('Strathern', 'Southland', 'suburb'),
('Te Anau', 'Southland', 'town'),
('Tuatapere', 'Southland', 'town'),
('Waikiwi', 'Southland', 'suburb'),
('Winton', 'Southland', 'town'),
('Bell Block', 'Taranaki', 'suburb'),
('Blagdon', 'Taranaki', 'suburb'),
('Brooklands', 'Taranaki', 'suburb'),
('Eltham', 'Taranaki', 'town'),
('Fitzroy', 'Taranaki', 'suburb'),
('Hawera', 'Taranaki', 'town'),
('Inglewood', 'Taranaki', 'town'),
('Merrilands', 'Taranaki', 'suburb'),
('Moturoa', 'Taranaki', 'suburb'),
('New Plymouth', 'Taranaki', 'city'),
('Opunake', 'Taranaki', 'town'),
('Spotswood', 'Taranaki', 'suburb'),
('Strandon', 'Taranaki', 'suburb'),
('Stratford', 'Taranaki', 'town'),
('Vogeltown', 'Taranaki', 'suburb'),
('Waitara', 'Taranaki', 'town'),
('Westown', 'Taranaki', 'suburb'),
('Motueka', 'Tasman', 'town'),
('Murchison', 'Tasman', 'town'),
('Richmond', 'Tasman', 'town'),
('Takaka', 'Tasman', 'town'),
('Wakefield', 'Tasman', 'town'),
('Beerescourt', 'Waikato', 'suburb'),
('Cambridge', 'Waikato', 'town'),
('Chartwell', 'Waikato', 'suburb'),
('Claudelands', 'Waikato', 'suburb'),
('Coromandel', 'Waikato', 'town'),
('Dinsdale', 'Waikato', 'suburb'),
('Enderley', 'Waikato', 'suburb'),
('Flagstaff', 'Waikato', 'suburb'),
('Forest Lake', 'Waikato', 'suburb'),
('Frankton', 'Waikato', 'suburb'),
('Glenview', 'Waikato', 'suburb'),
('Hamilton', 'Waikato', 'city'),
('Hamilton Lake', 'Waikato', 'suburb'),
('Huntly', 'Waikato', 'town'),
('Maeroa', 'Waikato', 'suburb'),
('Mangakino', 'Waikato', 'town'),
('Matamata', 'Waikato', 'town'),
('Melville', 'Waikato', 'suburb'),
('Morrinsville', 'Waikato', 'town'),
('Nawton', 'Waikato', 'suburb'),
('Ngaruawahia', 'Waikato', 'town'),
('Otorohanga', 'Waikato', 'town'),
('Paeroa', 'Waikato', 'town'),
('Putaruru', 'Waikato', 'town'),
('Queenwood', 'Waikato', 'suburb'),
('Raglan', 'Waikato', 'town'),
('Riverlea', 'Waikato', 'suburb'),
('Rototuna', 'Waikato', 'suburb'),
('Ruakura', 'Waikato', 'suburb'),
('Tairua', 'Waikato', 'town'),
('Taumarunui', 'Waikato', 'town'),
('Taupo', 'Waikato', 'city'),
('Te Awamutu', 'Waikato', 'town'),
('Te Kuiti', 'Waikato', 'town'),
('Te Rapa', 'Waikato', 'suburb'),
('Temple View', 'Waikato', 'suburb'),
('Thames', 'Waikato', 'town'),
('Tokoroa', 'Waikato', 'town'),
('Turangi', 'Waikato', 'town'),
('Waihi', 'Waikato', 'town'),
('Whangamata', 'Waikato', 'town'),
('Whitianga', 'Waikato', 'town'),
('Avalon', 'Wellington', 'suburb'),
('Berhampore', 'Wellington', 'suburb'),
('Birchville', 'Wellington', 'suburb'),
('Brooklyn', 'Wellington', 'suburb'),
('Carterton', 'Wellington', 'town'),
('Churton Park', 'Wellington', 'suburb'),
('Crofton Downs', 'Wellington', 'suburb'),
('Eastbourne', 'Wellington', 'suburb'),
('Eketahuna', 'Wellington', 'town'),
('Epuni', 'Wellington', 'suburb'),
('Featherston', 'Wellington', 'town'),
('Glenside', 'Wellington', 'suburb'),
('Grenada Village', 'Wellington', 'suburb'),
('Greytown', 'Wellington', 'town'),
('Hataitai', 'Wellington', 'suburb'),
('Island Bay', 'Wellington', 'suburb'),
('Johnsonville', 'Wellington', 'suburb'),
('Kaiwharawhara', 'Wellington', 'suburb'),
('Karori', 'Wellington', 'suburb'),
('Kelburn', 'Wellington', 'suburb'),
('Khandallah', 'Wellington', 'suburb'),
('Kilbirnie', 'Wellington', 'suburb'),
('Lower Hutt', 'Wellington', 'city'),
('Lyall Bay', 'Wellington', 'suburb'),
('Makara', 'Wellington', 'suburb'),
('Manor Park', 'Wellington', 'suburb'),
('Martinborough', 'Wellington', 'town'),
('Masterton', 'Wellington', 'city'),
('Maungaraki', 'Wellington', 'suburb'),
('Miramar', 'Wellington', 'suburb'),
('Mt Victoria', 'Wellington', 'suburb'),
('Naenae', 'Wellington', 'suburb'),
('Newlands', 'Wellington', 'suburb'),
('Newtown', 'Wellington', 'suburb'),
('Ngaio', 'Wellington', 'suburb'),
('Ngauranga', 'Wellington', 'suburb'),
('Northland', 'Wellington', 'suburb'),
('Otaki', 'Wellington', 'town'),
('Paparangi', 'Wellington', 'suburb'),
('Paraparaumu', 'Wellington', 'town'),
('Petone', 'Wellington', 'suburb'),
('Porirua', 'Wellington', 'city'),
('Rongotai', 'Wellington', 'suburb'),
('Seatoun', 'Wellington', 'suburb'),
('Stokes Valley', 'Wellington', 'suburb'),
('Strathmore Park', 'Wellington', 'suburb'),
('Taita', 'Wellington', 'suburb'),
('Tawa', 'Wellington', 'suburb'),
('Te Aro', 'Wellington', 'suburb'),
('Thorndon', 'Wellington', 'suburb'),
('Upper Hutt', 'Wellington', 'city'),
('Wadestown', 'Wellington', 'suburb'),
('Waikanae', 'Wellington', 'town'),
('Wainuiomata', 'Wellington', 'suburb'),
('Waterloo', 'Wellington', 'suburb'),
('Wellington', 'Wellington', 'city'),
('Woburn', 'Wellington', 'suburb'),
('Greymouth', 'West Coast', 'city'),
('Haast', 'West Coast', 'town'),
('Hokitika', 'West Coast', 'town'),
('Karamea', 'West Coast', 'town'),
('Reefton', 'West Coast', 'town'),
('Ross', 'West Coast', 'town'),
('Westport', 'West Coast', 'town')
ON CONFLICT (name, region) DO NOTHING;
