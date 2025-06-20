import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Please check your .env file contains:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'cybermeme-trading-platform'
    }
  }
});

// Test connection and log status
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully');
    console.log('Session:', data.session ? 'Active' : 'None');
    
    if (data.session) {
      console.log('👤 User:', data.session.user.email);
    }
  }
});

// Enhanced database types with proper relationships
export interface Database {
  public: {
    Tables: {
      memes: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          tags: string[];
          upvotes: number;
          owner_id: string;
          created_at: string;
          updated_at: string;
          price: number;
          description: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          image_url: string;
          tags?: string[];
          upvotes?: number;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
          price?: number;
          description?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string;
          tags?: string[];
          upvotes?: number;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
          price?: number;
          description?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          credits: number;
          avatar_url: string | null;
          bio: string | null;
          level: 'NEWBIE' | 'TRADER' | 'ELITE' | 'LEGEND';
          total_trades: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          credits?: number;
          avatar_url?: string | null;
          bio?: string | null;
          level?: 'NEWBIE' | 'TRADER' | 'ELITE' | 'LEGEND';
          total_trades?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          credits?: number;
          avatar_url?: string | null;
          bio?: string | null;
          level?: 'NEWBIE' | 'TRADER' | 'ELITE' | 'LEGEND';
          total_trades?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bids: {
        Row: {
          id: string;
          meme_id: string;
          bidder_id: string;
          amount: number;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          meme_id: string;
          bidder_id: string;
          amount: number;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          meme_id?: string;
          bidder_id?: string;
          amount?: number;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          meme_id: string;
          seller_id: string;
          buyer_id: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          meme_id: string;
          seller_id: string;
          buyer_id: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          meme_id?: string;
          seller_id?: string;
          buyer_id?: string;
          price?: number;
          created_at?: string;
        };
      };
      meme_votes: {
        Row: {
          id: string;
          meme_id: string;
          user_id: string;
          vote_type: 'upvote' | 'downvote';
          created_at: string;
        };
        Insert: {
          id?: string;
          meme_id: string;
          user_id: string;
          vote_type: 'upvote' | 'downvote';
          created_at?: string;
        };
        Update: {
          id?: string;
          meme_id?: string;
          user_id?: string;
          vote_type?: 'upvote' | 'downvote';
          created_at?: string;
        };
      };
    };
  };
}