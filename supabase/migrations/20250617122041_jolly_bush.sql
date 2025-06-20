/*
  # Fix memes to user_profiles foreign key relationship

  1. Changes
    - Drop the existing foreign key constraint from memes.owner_id to users.id
    - Add new foreign key constraint from memes.owner_id to user_profiles.id
    
  2. Reasoning
    - The application code expects to join memes with user_profiles
    - The current schema has memes.owner_id referencing users.id instead of user_profiles.id
    - This migration fixes the relationship to match the application's expectations
*/

-- Drop the existing foreign key constraint
ALTER TABLE public.memes DROP CONSTRAINT IF EXISTS memes_owner_id_fkey;

-- Add the correct foreign key constraint to user_profiles
ALTER TABLE public.memes 
ADD CONSTRAINT memes_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;