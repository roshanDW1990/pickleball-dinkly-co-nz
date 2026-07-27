/*
  # Create Tournament Registrations Table

  1. New Tables
    - `tournament_registrations`
      - `id` (uuid, primary key) - Unique registration ID
      - `tournament_id` (uuid, foreign key) - References tournaments table
      - `user_id` (uuid, foreign key) - References auth.users
      - `stripe_checkout_session_id` (text) - Stripe checkout session ID
      - `stripe_payment_intent_id` (text) - Stripe payment intent ID
      - `amount_paid` (numeric) - Amount paid in dollars
      - `payment_status` (text) - Payment status (pending, completed, failed)
      - `registered_at` (timestamptz) - Registration timestamp
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `tournament_registrations` table
    - Add policies for:
      - Users can view their own registrations
      - Users can create registrations (checkout)
      - Service role can update registrations (webhook)

  3. Indexes
    - Index on user_id for fast user registration lookups
    - Index on tournament_id for fast tournament registration lookups
    - Unique index on (user_id, tournament_id) to prevent duplicate registrations
*/

-- Create tournament_registrations table
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_paid numeric(10, 2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  registered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_user_id ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_checkout_session ON tournament_registrations(stripe_checkout_session_id);

-- Create unique constraint to prevent duplicate registrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_registrations_unique 
  ON tournament_registrations(user_id, tournament_id);

-- Enable RLS
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON tournament_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create registrations (for checkout)
CREATE POLICY "Users can create registrations"
  ON tournament_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending registrations
CREATE POLICY "Users can update own pending registrations"
  ON tournament_registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND payment_status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tournament_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tournament_registrations_updated_at
  BEFORE UPDATE ON tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_registrations_updated_at();