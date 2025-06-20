/*
  # Fix Authentication System and Database Relationships

  1. Database Structure
    - Fix foreign key constraints to reference auth.users properly
    - Ensure all user references point to auth.users.id
    
  2. Authentication
    - Create trigger function for automatic profile creation
    - Set up proper user profile initialization
    
  3. Security
    - Enable RLS on all tables
    - Create comprehensive security policies
    - Allow public reading where appropriate
    
  4. Data Integrity
    - Ensure referential integrity across all tables
    - Handle cascade deletions properly
*/

-- First, drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on user_profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
    
    -- Drop all policies on memes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'memes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON memes';
    END LOOP;
    
    -- Drop all policies on bids
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bids' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON bids';
    END LOOP;
    
    -- Drop all policies on trades
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trades' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON trades';
    END LOOP;
    
    -- Drop all policies on meme_votes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'meme_votes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON meme_votes';
    END LOOP;
END $$;

-- Drop existing problematic foreign key constraints
DO $$ 
BEGIN
    -- Drop constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_profiles_id_fkey' AND table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bids_bidder_id_fkey' AND table_name = 'bids') THEN
        ALTER TABLE bids DROP CONSTRAINT bids_bidder_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'trades_buyer_id_fkey' AND table_name = 'trades') THEN
        ALTER TABLE trades DROP CONSTRAINT trades_buyer_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'trades_seller_id_fkey' AND table_name = 'trades') THEN
        ALTER TABLE trades DROP CONSTRAINT trades_seller_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'meme_votes_user_id_fkey' AND table_name = 'meme_votes') THEN
        ALTER TABLE meme_votes DROP CONSTRAINT meme_votes_user_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'memes_owner_id_fkey' AND table_name = 'memes') THEN
        ALTER TABLE memes DROP CONSTRAINT memes_owner_id_fkey;
    END IF;
END $$;

-- Create proper foreign key constraints referencing auth.users
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

ALTER TABLE memes 
ADD CONSTRAINT memes_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, credits, avatar_url, bio, level, total_trades)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    1000, -- default credits
    null, -- default avatar
    null, -- default bio
    'NEWBIE', -- default level
    0 -- default total trades
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Create trigger that calls the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "public_profiles_read" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for memes
CREATE POLICY "public_memes_read" ON memes
  FOR SELECT USING (true);

CREATE POLICY "authenticated_users_create_memes" ON memes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owners_update_memes" ON memes
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "owners_delete_memes" ON memes
  FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for bids
CREATE POLICY "users_read_relevant_bids" ON bids
  FOR SELECT USING (
    bidder_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM memes 
      WHERE memes.id = bids.meme_id AND memes.owner_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_users_create_bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "meme_owners_update_bids" ON bids
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memes 
      WHERE memes.id = bids.meme_id AND memes.owner_id = auth.uid()
    )
  );

-- Create RLS policies for trades
CREATE POLICY "public_trades_read" ON trades
  FOR SELECT USING (true);

CREATE POLICY "system_create_trades" ON trades
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for meme_votes
CREATE POLICY "public_votes_read" ON meme_votes
  FOR SELECT USING (true);

CREATE POLICY "users_create_votes" ON meme_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_votes" ON meme_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_votes" ON meme_votes
  FOR DELETE USING (auth.uid() = user_id);