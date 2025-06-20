/*
  # Create memes table for CyberMeme Trading Platform

  1. New Tables
    - `memes`
      - `id` (uuid, primary key)
      - `title` (text, meme title)
      - `image_url` (text, meme image URL)
      - `tags` (text array, meme tags)
      - `upvotes` (integer, vote count)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `price` (integer, current price in credits)
      - `description` (text, optional description)

  2. Security
    - Enable RLS on `memes` table
    - Add policies for authenticated users to read all memes
    - Add policies for users to create their own memes
    - Add policies for users to update their own memes
*/

CREATE TABLE IF NOT EXISTS memes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  price integer DEFAULT 100,
  description text
);

ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Policy for reading memes (all authenticated users can read all memes)
CREATE POLICY "Anyone can read memes"
  ON memes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for creating memes (users can create their own memes)
CREATE POLICY "Users can create their own memes"
  ON memes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Policy for updating memes (users can update their own memes)
CREATE POLICY "Users can update their own memes"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy for deleting memes (users can delete their own memes)
CREATE POLICY "Users can delete their own memes"
  ON memes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS memes_owner_id_idx ON memes(owner_id);
CREATE INDEX IF NOT EXISTS memes_created_at_idx ON memes(created_at DESC);
CREATE INDEX IF NOT EXISTS memes_upvotes_idx ON memes(upvotes DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_memes_updated_at
  BEFORE UPDATE ON memes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();