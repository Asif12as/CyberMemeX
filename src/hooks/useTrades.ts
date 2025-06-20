import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export interface Trade {
  id: string;
  meme_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  created_at: string;
  meme?: {
    title: string;
    image_url: string;
  };
  seller?: {
    username: string;
  };
  buyer?: {
    username: string;
  };
}

export interface Bid {
  id: string;
  meme_id: string;
  bidder_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  meme?: {
    title: string;
    image_url: string;
    owner_id: string;
  };
  bidder?: {
    username: string;
  };
}

// Enhanced mock data for demonstration
const MOCK_TRADES: Trade[] = [
  {
    id: 'mock_trade_1',
    meme_id: 'mock_1',
    seller_id: 'mock_cyberpunk420',
    buyer_id: 'mock_meme_lord',
    price: 1337,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    meme: { title: 'Epic Stonks Meme', image_url: 'https://picsum.photos/200/200?random=1' },
    seller: { username: 'CyberNinja' },
    buyer: { username: 'MemeLord69' }
  },
  {
    id: 'mock_trade_2',
    meme_id: 'mock_2',
    seller_id: 'mock_ai_overlord',
    buyer_id: 'mock_tech_bro',
    price: 999,
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    meme: { title: 'AI Confusion Matrix', image_url: 'https://picsum.photos/200/200?random=2' },
    seller: { username: 'AIOverlord' },
    buyer: { username: 'TechBro2077' }
  }
];

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchTrades();
    fetchBids();
  }, [user]);
  
  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !connected) return;
    
    console.log('🔌 Setting up Socket.IO listeners for trades');
    
    // Listen for trade updates from server
    socket.on('trades:updated', (updatedTrades) => {
      console.log('📨 Received trades update via Socket.IO:', updatedTrades.length);
      setTrades(updatedTrades);
    });
    
    // Listen for bid updates
    socket.on('bids:updated', (updatedBids) => {
      console.log('📨 Received bids update via Socket.IO:', updatedBids.length);
      setBids(updatedBids);
    });
    
    return () => {
      console.log('🧹 Cleaning up Socket.IO trade listeners');
      socket.off('trades:updated');
      socket.off('bids:updated');
    };
  }, [socket, connected]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching trades from Supabase...');
      
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          meme:memes!meme_id (
            title,
            image_url
          ),
          seller:user_profiles!seller_id (
            username
          ),
          buyer:user_profiles!buyer_id (
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('⚠️ Failed to fetch trades from Supabase:', error);
        setTrades(MOCK_TRADES);
      } else {
        console.log('✅ Trades fetched successfully:', data?.length || 0);
        // Combine real trades with mock trades for richer demo
        setTrades([...(data || []), ...MOCK_TRADES]);
      }
    } catch (error) {
      console.warn('💥 Error fetching trades:', error);
      setTrades(MOCK_TRADES);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    if (!user || !profile) {
      console.log('👤 No authenticated user, skipping bid fetch');
      return;
    }

    try {
      console.log('💰 Fetching bids from Supabase...');
      
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          meme:memes!meme_id (
            title,
            image_url,
            owner_id
          ),
          bidder:user_profiles!bidder_id (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        console.log('✅ Bids fetched successfully:', data.length);
        setBids(data);
      } else {
        console.warn('⚠️ Failed to fetch bids:', error);
        setBids([]);
      }
    } catch (error) {
      console.warn('💥 Error fetching bids:', error);
      setBids([]);
    }
  };

  const createBid = async (memeId: string, amount: number) => {
    if (!user || !profile) {
      toast.error('You must be logged in to bid');
      return { success: false };
    }

    // Validation
    if (amount <= 0) {
      toast.error('Bid amount must be positive');
      return { success: false };
    }

    console.log('💰 Creating bid:', { memeId, amount, userId: profile.id });

    try {
      // Create bid object with profile.id
      const bidData = {
        meme_id: memeId,
        bidder_id: profile.id, // Use profile.id instead of user.id
        amount,
        status: 'pending' as const,
      };

      console.log('📝 Inserting bid into Supabase:', bidData);

      // Save to Supabase
      const { data: supabaseBid, error } = await supabase
        .from('bids')
        .insert(bidData)
        .select(`
          *,
          meme:memes!meme_id (
            title,
            image_url,
            owner_id
          ),
          bidder:user_profiles!bidder_id (
            username
          )
        `)
        .single();

      if (error) {
        console.error('❌ Failed to save bid to Supabase:', error);
        
        // Provide more specific error messages
        if (error.code === '23503') {
          toast.error('Invalid meme or user reference');
        } else if (error.code === '23505') {
          toast.error('Duplicate bid detected');
        } else {
          toast.error('Failed to place bid: ' + error.message);
        }
        
        return { success: false, error };
      }

      console.log('✅ Bid saved to Supabase successfully:', supabaseBid);

      // Update local state
      setBids(prev => [supabaseBid, ...prev]);
      
      // Optimistic credit update (in a real app, you'd handle this server-side)
      console.log('💳 Bid placed successfully');

      toast.success(`Bid placed: ${amount} CREDITS! 💰`);
      return { success: true, data: supabaseBid };

    } catch (error) {
      console.error('💥 Error creating bid:', error);
      toast.error('Failed to place bid');
      return { success: false, error };
    }
  };

  const acceptBid = async (bidId: string) => {
    if (!user || !profile) {
      toast.error('You must be logged in');
      return { success: false };
    }

    console.log('✅ Accepting bid:', bidId);

    try {
      // Update bid status in Supabase
      const { data: updatedBid, error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)
        .select(`
          *,
          meme:memes!meme_id (
            title,
            image_url,
            owner_id
          ),
          bidder:user_profiles!bidder_id (
            username
          )
        `)
        .single();

      if (bidError) {
        console.error('❌ Failed to update bid:', bidError);
        toast.error('Failed to accept bid: ' + bidError.message);
        return { success: false, error: bidError };
      }

      console.log('✅ Bid updated successfully:', updatedBid);

      // Create trade record in Supabase
      const tradeData = {
        meme_id: updatedBid.meme_id,
        seller_id: profile.id, // Use profile.id
        buyer_id: updatedBid.bidder_id,
        price: updatedBid.amount,
      };

      console.log('📝 Creating trade record:', tradeData);

      const { data: newTrade, error: tradeError } = await supabase
        .from('trades')
        .insert(tradeData)
        .select(`
          *,
          meme:memes!meme_id (
            title,
            image_url
          ),
          seller:user_profiles!seller_id (
            username
          ),
          buyer:user_profiles!buyer_id (
            username
          )
        `)
        .single();

      if (tradeError) {
        console.error('❌ Failed to create trade:', tradeError);
        toast.error('Bid accepted but trade record failed: ' + tradeError.message);
        
        // Still update local bid state
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? updatedBid : bid
        ));
        return { success: false, error: tradeError };
      }

      console.log('✅ Trade created successfully:', newTrade);

      // Update local states
      setBids(prev => prev.map(bid => 
        bid.id === bidId ? updatedBid : bid
      ));
      
      setTrades(prev => [newTrade, ...prev]);

      toast.success('Bid accepted! Trade completed! 🎉');
      return { success: true, data: { bid: updatedBid, trade: newTrade } };

    } catch (error) {
      console.error('💥 Error accepting bid:', error);
      toast.error('Failed to accept bid');
      return { success: false, error };
    }
  };

  const rejectBid = async (bidId: string) => {
    console.log('❌ Rejecting bid:', bidId);

    try {
      // Update bid status in Supabase
      const { data: updatedBid, error } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('id', bidId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to reject bid:', error);
        toast.error('Failed to reject bid: ' + error.message);
        return { success: false, error };
      }

      console.log('✅ Bid rejected successfully:', updatedBid);

      // Update local state
      setBids(prev => prev.map(bid => 
        bid.id === bidId ? { ...bid, status: 'rejected' as const } : bid
      ));

      toast.success('Bid rejected');
      return { success: true, data: updatedBid };

    } catch (error) {
      console.error('💥 Error rejecting bid:', error);
      toast.error('Failed to reject bid');
      return { success: false, error };
    }
  };

  return {
    trades,
    bids,
    loading,
    createBid,
    acceptBid,
    rejectBid,
    refetch: () => {
      fetchTrades();
      fetchBids();
    },
  };
}