/*
  # Create bids table for meme trading

  1. New Tables
    - `bids`
      - `id` (uuid, primary key)
      - `meme_id` (uuid, references memes)
      - `bidder_id` (uuid, references auth.users)
      - `amount` (integer, bid amount in credits)
      - `status` (text, bid status: pending, accepted, rejected)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `bids` table
    - Add policies for authenticated users to read bids
    - Add policies for users to create bids
    - Add policies for meme owners to update bid status
*/

CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE NOT NULL,
  bidder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policy for reading bids (users can read bids for their memes or their own bids)
CREATE POLICY "Users can read relevant bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (
    bidder_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM memes 
      WHERE memes.id = bids.meme_id 
      AND memes.owner_id = auth.uid()
    )
  );

-- Policy for creating bids (authenticated users can create bids)
CREATE POLICY "Users can create bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

-- Policy for updating bids (only meme owners can update bid status)
CREATE POLICY "Meme owners can update bid status"
  ON bids
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memes 
      WHERE memes.id = bids.meme_id 
      AND memes.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bids_meme_id_idx ON bids(meme_id);
CREATE INDEX IF NOT EXISTS bids_bidder_id_idx ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS bids_created_at_idx ON bids(created_at DESC);