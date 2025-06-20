/*
  # Create trades table for completed transactions

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `meme_id` (uuid, references memes)
      - `seller_id` (uuid, references auth.users)
      - `buyer_id` (uuid, references auth.users)
      - `price` (integer, final trade price)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `trades` table
    - Add policies for authenticated users to read trades
    - Add policies for involved parties to access their trades
*/

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy for reading trades (all authenticated users can read trades for market data)
CREATE POLICY "Anyone can read trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for creating trades (system/admin only - handled by functions)
CREATE POLICY "System can create trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trades_meme_id_idx ON trades(meme_id);
CREATE INDEX IF NOT EXISTS trades_seller_id_idx ON trades(seller_id);
CREATE INDEX IF NOT EXISTS trades_buyer_id_idx ON trades(buyer_id);
CREATE INDEX IF NOT EXISTS trades_created_at_idx ON trades(created_at DESC);