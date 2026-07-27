/*
  # Add phone number to user profiles

  ## Changes
  1. Add phone_number column to profiles table
  2. This allows users to share contact information for coordinating matches
  
  ## Notes
  - Phone number is optional but recommended for better communication
  - Used for creating WhatsApp groups and coordinating match times
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN phone_number text;
  END IF;
END $$;
