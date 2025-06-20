import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export interface Meme {
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
  owner?: {
    username: string;
    level: string;
  };
  highest_bid?: number;
  highest_bidder?: string;
  user_vote?: 'upvote' | 'downvote' | null;
}

// Enhanced mock data for demonstration
const MOCK_MEMES: Meme[] = [
  {
    id: 'mock_1',
    title: 'When the blockchain validates your existence',
    image_url: 'https://picsum.photos/800/600?random=1',
    tags: ['crypto', 'blockchain', 'validation'],
    upvotes: 420,
    owner_id: 'mock_cyberpunk420',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    price: 1337,
    description: 'Peak cyberpunk vibes when your digital identity gets verified',
    owner: { username: 'CyberNinja', level: 'LEGEND' },
    highest_bid: 1500,
    highest_bidder: 'MemeLord69',
    user_vote: null
  },
  {
    id: 'mock_2',
    title: 'AI trying to understand human humor',
    image_url: 'https://picsum.photos/800/600?random=2',
    tags: ['ai', 'humor', 'confusion'],
    upvotes: 666,
    owner_id: 'mock_ai_overlord',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    price: 999,
    description: 'Neural networks attempting to decode the mysteries of comedy',
    owner: { username: 'AIOverlord', level: 'ELITE' },
    highest_bid: 1200,
    highest_bidder: 'TechBro2077',
    user_vote: null
  },
  {
    id: 'mock_3',
    title: 'Stonks in the Matrix',
    image_url: 'https://picsum.photos/800/600?random=stonks',
    tags: ['stonks', 'matrix', 'finance'],
    upvotes: 1337,
    owner_id: 'mock_matrix_trader',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    price: 2077,
    description: 'To the moon! 🚀 When your portfolio enters the digital realm',
    owner: { username: 'MatrixTrader', level: 'TRADER' },
    highest_bid: 2500,
    highest_bidder: 'DiamondHands',
    user_vote: null
  }
];

export function useMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchMemes();
  }, [user]);
  
  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !connected) return;
    
    console.log('🔌 Setting up Socket.IO listeners for memes');
    
    // Listen for meme updates from server
    socket.on('memes:updated', (updatedMemes) => {
      console.log('📨 Received memes update via Socket.IO:', updatedMemes.length);
      setMemes(updatedMemes);
    });
    
    return () => {
      console.log('🧹 Cleaning up Socket.IO meme listeners');
      socket.off('memes:updated');
    };
  }, [socket, connected]);

  const fetchMemes = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching memes from Supabase...');
      
      // Fetch from Supabase with proper error handling
      const { data, error } = await supabase
        .from('memes')
        .select(`
          *,
          owner:user_profiles!owner_id (
            username,
            level
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Supabase fetch failed:', error.message);
        console.log('🔄 Using mock data as fallback');
        setMemes(MOCK_MEMES);
      } else {
        console.log('✅ Memes fetched from Supabase:', data?.length || 0);
        
        // Enhance real memes with additional data and user votes
        const enhancedMemes = await Promise.all((data || []).map(async (meme) => {
          let userVote = null;
          
          // Fetch user's vote for this meme if authenticated
          if (user) {
            try {
              const { data: voteData } = await supabase
                .from('meme_votes')
                .select('vote_type')
                .eq('meme_id', meme.id)
                .eq('user_id', user.id)
                .single();
              
              userVote = voteData?.vote_type || null;
            } catch (error) {
              // No vote found, which is fine
            }
          }

          return {
            ...meme,
            // Add mock bid data for demonstration
            highest_bid: Math.floor(Math.random() * 1000) + meme.price,
            highest_bidder: ['CyberNinja', 'MemeLord69', 'TechBro2077', 'DiamondHands'][Math.floor(Math.random() * 4)],
            user_vote: userVote
          };
        }));
        
        // Combine real memes with mock memes for richer demo experience
        setMemes([...enhancedMemes, ...MOCK_MEMES]);
      }
    } catch (error) {
      console.warn('💥 Error fetching memes:', error);
      console.log('🔄 Using mock data as fallback');
      setMemes(MOCK_MEMES);
    } finally {
      setLoading(false);
    }
  };

  const createMeme = async (memeData: {
    title: string;
    image_url: string;
    tags: string[];
    description?: string;
    price?: number;
  }) => {
    if (!user || !profile) {
      toast.error('You must be logged in to create memes');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      console.log('🎨 Creating meme:', memeData);
      
      // Use default stonks image if no image provided
      const imageUrl = memeData.image_url || 'https://picsum.photos/800/600?random=stonks';
      
      const memePayload = {
        title: memeData.title,
        image_url: imageUrl,
        tags: memeData.tags,
        description: memeData.description || null,
        price: memeData.price || 100,
        owner_id: profile.id // Use profile.id instead of user.id
      };

      console.log('💾 Saving meme to Supabase...', memePayload);
      
      // Save to Supabase
      const { data: savedMeme, error } = await supabase
        .from('memes')
        .insert(memePayload)
        .select(`
          *,
          owner:user_profiles!owner_id (
            username,
            level
          )
        `)
        .single();
      
      if (error) {
        console.error('❌ Failed to save meme to Supabase:', error);
        toast.error('Failed to save meme: ' + error.message);
        return { success: false, error };
      }

      console.log('✅ Meme saved to Supabase successfully:', savedMeme);

      // Create enhanced meme object for local state
      const enhancedMeme: Meme = {
        ...savedMeme,
        highest_bid: 0,
        highest_bidder: undefined,
        user_vote: null
      };

      // Update local state
      setMemes(prev => [enhancedMeme, ...prev]);
      
      toast.success('Meme deployed to the matrix! 🚀');
      return { success: true, data: enhancedMeme };

    } catch (error) {
      console.error('💥 Error creating meme:', error);
      toast.error('Failed to deploy meme');
      return { success: false, error };
    }
  };

  const voteMeme = async (memeId: string, voteType: 'upvote' | 'downvote') => {
    if (!user || !profile) {
      toast.error('You must be logged in to vote!');
      return { success: false };
    }

    try {
      console.log('🗳️ Voting on meme:', { memeId, voteType, userId: profile.id });
      
      const currentMeme = memes.find(m => m.id === memeId);
      if (!currentMeme) {
        toast.error('Meme not found');
        return { success: false };
      }

      // Check if user owns this meme
      if (currentMeme.owner_id === profile.id) {
        toast.error("You can't vote on your own meme!");
        return { success: false };
      }

      // Check if user already voted
      const existingVote = currentMeme.user_vote;
      
      if (existingVote === voteType) {
        toast.error(`You already ${voteType}d this meme!`);
        return { success: false };
      }

      // Handle voting in Supabase
      try {
        if (existingVote) {
          // Update existing vote
          await supabase
            .from('meme_votes')
            .update({ vote_type: voteType })
            .eq('meme_id', memeId)
            .eq('user_id', profile.id);
        } else {
          // Insert new vote
          await supabase
            .from('meme_votes')
            .insert({
              meme_id: memeId,
              user_id: profile.id,
              vote_type: voteType
            });
        }
        console.log('✅ Vote saved to Supabase');
      } catch (error) {
        console.warn('⚠️ Failed to save vote to Supabase:', error);
        // Continue with local update anyway
      }

      // Update local state optimistically
      setMemes(prev => prev.map(meme => {
        if (meme.id === memeId) {
          let newUpvotes = meme.upvotes;
          
          // Remove previous vote effect
          if (existingVote === 'upvote') {
            newUpvotes -= 1;
          } else if (existingVote === 'downvote') {
            newUpvotes += 1;
          }
          
          // Apply new vote effect
          if (voteType === 'upvote') {
            newUpvotes += 1;
          } else if (voteType === 'downvote') {
            newUpvotes -= 1;
          }

          return {
            ...meme,
            upvotes: Math.max(0, newUpvotes),
            user_vote: voteType
          };
        }
        return meme;
      }));

      const action = voteType === 'upvote' ? 'Upvoted! 🚀' : 'Downvoted 📉';
      toast.success(action);
      return { success: true };
    } catch (error) {
      console.error('💥 Error voting:', error);
      toast.error('Failed to vote');
      return { success: false, error };
    }
  };

  const getLeaderboard = (limit = 10) => {
    return [...memes]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit);
  };

  return {
    memes,
    loading,
    createMeme,
    voteMeme,
    getLeaderboard,
    refetch: fetchMemes,
  };
}