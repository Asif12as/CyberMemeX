/*
  # Create meme votes table for upvote/downvote system

  1. New Tables
    - `meme_votes`
      - `id` (uuid, primary key)
      - `meme_id` (uuid, references memes)
      - `user_id` (uuid, references auth.users)
      - `vote_type` (text, 'upvote' or 'downvote')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `meme_votes` table
    - Add policies for authenticated users to vote
    - Ensure users can only vote once per meme
*/

CREATE TABLE IF NOT EXISTS meme_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(meme_id, user_id)
);

ALTER TABLE meme_votes ENABLE ROW LEVEL SECURITY;

-- Policy for reading votes (all authenticated users can read votes)
CREATE POLICY "Anyone can read meme votes"
  ON meme_votes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for creating/updating votes (users can vote on memes)
CREATE POLICY "Users can vote on memes"
  ON meme_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating votes (users can change their vote)
CREATE POLICY "Users can update their votes"
  ON meme_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting votes (users can remove their vote)
CREATE POLICY "Users can delete their votes"
  ON meme_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meme_votes_meme_id_idx ON meme_votes(meme_id);
CREATE INDEX IF NOT EXISTS meme_votes_user_id_idx ON meme_votes(user_id);

-- Function to update meme upvote count
CREATE OR REPLACE FUNCTION update_meme_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the upvotes count in memes table
  UPDATE memes 
  SET upvotes = (
    SELECT COUNT(*) 
    FROM meme_votes 
    WHERE meme_id = COALESCE(NEW.meme_id, OLD.meme_id) 
    AND vote_type = 'upvote'
  )
  WHERE id = COALESCE(NEW.meme_id, OLD.meme_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update vote count
CREATE TRIGGER update_meme_votes_on_insert
  AFTER INSERT ON meme_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_meme_vote_count();

CREATE TRIGGER update_meme_votes_on_update
  AFTER UPDATE ON meme_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_meme_vote_count();

CREATE TRIGGER update_meme_votes_on_delete
  AFTER DELETE ON meme_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_meme_vote_count();