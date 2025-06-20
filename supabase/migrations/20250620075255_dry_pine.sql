/*
  # Fix authentication trigger and profile creation

  1. Changes
    - Drop and recreate the user profile creation trigger
    - Ensure proper error handling in the trigger function
    - Add better logging and fallback mechanisms
    
  2. Security
    - Maintain all existing RLS policies
    - Ensure trigger runs with proper permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_username text;
BEGIN
  -- Extract username from metadata or generate from email
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Insert new profile with error handling
  BEGIN
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
      new_username,
      1000, -- default credits
      null, -- default avatar
      null, -- default bio
      'NEWBIE', -- default level
      0, -- default total trades
      now(),
      now()
    );
    
    -- Log successful profile creation
    RAISE LOG 'Profile created successfully for user: %', NEW.email;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.email, SQLERRM;
    
    -- Try with a modified username in case of conflict
    BEGIN
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
        new_username || '_' || substr(NEW.id::text, 1, 4),
        1000,
        null,
        null,
        'NEWBIE',
        0,
        now(),
        now()
      );
      
      RAISE LOG 'Profile created with modified username for user: %', NEW.email;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Failed to create profile even with modified username for user %: %', NEW.email, SQLERRM;
    END;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that calls the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;