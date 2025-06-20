/*
  # Fix memes table foreign key relationship

  1. Changes
    - Update memes.owner_id foreign key to reference user_profiles(id) instead of users(id)
    - This allows proper joining between memes and user_profiles tables

  2. Security
    - No changes to existing RLS policies
*/

-- Drop the existing foreign key constraint
ALTER TABLE memes DROP CONSTRAINT IF EXISTS memes_owner_id_fkey;

-- Add the new foreign key constraint pointing to user_profiles
ALTER TABLE memes ADD CONSTRAINT memes_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE CASCADE;