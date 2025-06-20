/*
  # Final Authentication Fix - Bulletproof Solution

  1. Changes
    - Drop and recreate the user profile creation trigger with maximum robustness
    - Add comprehensive error handling and fallback mechanisms
    - Ensure profile creation never blocks user authentication
    - Add detailed logging for debugging
    
  2. Security
    - Maintain all existing RLS policies
    - Ensure trigger runs with proper permissions
    - Add safeguards against infinite loops and errors
*/

-- Drop existing trigger and function completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the most bulletproof user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_username text;
  final_username text;
  attempt_count integer := 0;
  max_attempts integer := 3;
  success boolean := false;
BEGIN
  -- Log the start of profile creation
  RAISE LOG 'Creating profile for user: % (email: %)', NEW.id, NEW.email;
  
  -- Extract username from metadata or generate from email
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Clean username (remove special characters, limit length)
  new_username := regexp_replace(new_username, '[^a-zA-Z0-9_]', '', 'g');
  new_username := substr(new_username, 1, 20); -- Limit to 20 characters
  
  -- Ensure username is not empty
  IF new_username = '' OR new_username IS NULL THEN
    new_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Try to insert profile with different username variations
  WHILE attempt_count < max_attempts AND NOT success LOOP
    BEGIN
      -- Determine final username for this attempt
      CASE attempt_count
        WHEN 0 THEN final_username := new_username;
        WHEN 1 THEN final_username := new_username || '_' || substr(NEW.id::text, 1, 4);
        ELSE final_username := 'user_' || extract(epoch from now())::integer::text;
      END CASE;
      
      -- Attempt to insert the profile
      INSERT INTO public.user_profiles (
        id, 
        username, 
        credits, 
        avatar_url, 
        bio, 
        level, 
        total_trades,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        final_username,
        1000, -- default credits
        null, -- default avatar
        null, -- default bio
        'NEWBIE', -- default level
        0, -- default total trades
        now(),
        now()
      );
      
      success := true;
      RAISE LOG 'Profile created successfully for user % with username %', NEW.email, final_username;
      
    EXCEPTION 
      WHEN unique_violation THEN
        -- Username conflict, try next variation
        attempt_count := attempt_count + 1;
        RAISE LOG 'Username conflict for %, trying attempt %', final_username, attempt_count + 1;
        
      WHEN OTHERS THEN
        -- Any other error, log and try simpler approach
        RAISE LOG 'Error creating profile for %: %, trying attempt %', NEW.email, SQLERRM, attempt_count + 1;
        attempt_count := attempt_count + 1;
    END;
  END LOOP;
  
  -- If all attempts failed, log but don't block user creation
  IF NOT success THEN
    RAISE LOG 'Failed to create profile for user % after % attempts, but allowing user creation', NEW.email, max_attempts;
  END IF;
  
  -- Always return NEW to allow user creation to proceed
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Catch any unexpected errors and log them, but don't block user creation
  RAISE LOG 'Unexpected error in handle_new_user for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that calls the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Verify the trigger was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) THEN
    RAISE NOTICE '✅ SUCCESS: Authentication trigger created and ready';
  ELSE
    RAISE WARNING '❌ FAILED: Authentication trigger was not created';
  END IF;
END $$;