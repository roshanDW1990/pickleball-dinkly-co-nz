/*
  # Enable pg_net extension
  
  1. Changes
    - Enable the pg_net extension which is required for the welcome email trigger
    - This extension allows asynchronous HTTP requests from within the database
  
  2. Notes
    - pg_net is a Supabase-provided extension for async HTTP calls
    - Required for the send_welcome_email_trigger function to work
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
