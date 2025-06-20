/*
  # Fix foreign key references to use auth.users

  1. Changes
    - Drop existing foreign key constraints that reference non-existent 'users' table
    - Add correct foreign key constraints that reference 'auth.users' table
    - This fixes the "Database error saving new user" issue during signup

  2. Tables affected
    - user_profiles: Fix foreign key to reference auth.users(id)
    - bids: Fix foreign key to reference auth.users(id) 
    - trades: Fix foreign keys to reference auth.users(id)
    - meme_votes: Fix foreign key to reference auth.users(id)

  3. Security
    - All existing RLS policies remain unchanged
    - Foreign key constraints ensure data integrity with Supabase auth
*/

-- Drop existing foreign key constraints that reference the non-existent 'users' table
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_bidder_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_buyer_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_seller_id_fkey;
ALTER TABLE meme_votes DROP CONSTRAINT IF EXISTS meme_votes_user_id_fkey;

-- Add correct foreign key constraints that reference auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE bids 
ADD CONSTRAINT bids_bidder_id_fkey 
FOREIGN KEY (bidder_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE trades 
ADD CONSTRAINT trades_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE trades 
ADD CONSTRAINT trades_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE meme_votes 
ADD CONSTRAINT meme_votes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;