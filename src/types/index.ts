export interface Meme {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  upvotes: number;
  owner_id: string;
  created_at: string;
}

export interface Bid {
  id: string;
  meme_id: string;
  user_id: string;
  credits: number;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  credits: number;
  created_at: string;
}

export interface TradeData {
  id: string;
  meme_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  created_at: string;
}