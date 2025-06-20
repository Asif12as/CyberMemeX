import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, TrendingUp, Eye, User, Calendar, Tag, DollarSign, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Meme } from '../hooks/useMemes';
import { useMemes } from '../context/MemeContext';
import { useTrades } from '../hooks/useTrades';
import { useAuth } from '../hooks/useAuth';

interface MemeCardProps {
  meme: Meme;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [bidAmount, setBidAmount] = useState(meme.price + 100);
  const [showBidInput, setShowBidInput] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);
  const { voteMeme } = useMemes();
  const { createBid } = useTrades();
  const { isAuthenticated, profile, user } = useAuth();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    await voteMeme(meme.id, voteType);
  };

  const handleBid = async () => {
    if (!isAuthenticated || !user || !profile) {
      toast.error('You must be logged in to bid');
      return;
    }

    if (bidAmount <= meme.price) {
      toast.error('Bid must be higher than current price');
      return;
    }

    setBidLoading(true);
    console.log('💰 Placing bid:', { memeId: meme.id, amount: bidAmount });

    const result = await createBid(meme.id, bidAmount);
    
    if (result.success) {
      setShowBidInput(false);
      setBidAmount(meme.price + 100);
      console.log('✅ Bid placed successfully');
    } else {
      console.error('❌ Bid failed:', result.error);
    }
    
    setBidLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canBid = isAuthenticated && profile && profile.id !== meme.owner_id;
  const canVote = isAuthenticated && user;
  const isOwner = user?.id === meme.owner_id;

  return (
    <motion.div
      className="bg-black/90 border border-gray-600 hover:border-cyber-blue/50 
                 transition-all duration-300 group overflow-hidden relative"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-900">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={meme.image_url}
          alt={meme.title}
          className={`w-full h-full object-cover transition-all duration-500 
                     ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                     group-hover:scale-110`}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageLoaded(true)}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{Math.floor(Math.random() * 5000) + 1000}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyber-green" />
                <span className="text-sm text-cyber-green">+{Math.floor(Math.random() * 50) + 10}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-cyber-blue/90 text-black px-3 py-1 text-sm font-orbitron font-bold">
          {meme.price} CR
        </div>

        {/* Owner badge */}
        {isOwner && (
          <div className="absolute top-4 left-4 bg-cyber-green/90 text-black px-2 py-1 text-xs font-orbitron font-bold">
            YOUR MEME
          </div>
        )}

        {/* Highest bid badge */}
        {meme.highest_bid && meme.highest_bid > meme.price && (
          <div className="absolute bottom-4 left-4 bg-cyber-green/90 text-black px-2 py-1 text-xs font-orbitron font-bold">
            HIGH BID: {meme.highest_bid} CR
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="font-orbitron font-bold text-cyan-400 text-lg leading-tight line-clamp-2">
          {meme.title}
        </h3>

        {/* Description */}
        {meme.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {meme.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {meme.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-cyber-blue/20 text-cyber-blue px-2 py-1 
                         font-mono border border-cyber-blue/30"
            >
              #{tag}
            </span>
          ))}
          {meme.tags.length > 3 && (
            <span className="text-xs text-gray-400 px-2 py-1">
              +{meme.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="font-mono">
              {meme.owner?.username || `USER_${meme.owner_id.slice(0, 6)}`}
            </span>
            {meme.owner?.level && (
              <span className={`text-xs px-2 py-0.5 rounded font-orbitron ${
                meme.owner.level === 'LEGEND' ? 'bg-yellow-500/20 text-yellow-400' :
                meme.owner.level === 'ELITE' ? 'bg-purple-500/20 text-purple-400' :
                meme.owner.level === 'TRADER' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {meme.owner.level}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(meme.created_at)}</span>
          </div>
        </div>

        {/* Highest Bidder Info */}
        {meme.highest_bidder && meme.highest_bid && meme.highest_bid > meme.price && (
          <div className="bg-cyber-green/10 border border-cyber-green/30 p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-cyber-green font-orbitron">HIGHEST BIDDER:</span>
              <span className="text-xs text-cyber-green font-mono">{meme.highest_bidder}</span>
            </div>
            <div className="text-cyber-green font-bold text-lg">{meme.highest_bid} CREDITS</div>
          </div>
        )}

        {/* Voting Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-1">
            {/* Upvote Button */}
            <motion.button
              onClick={() => handleVote('upvote')}
              disabled={!canVote || isOwner}
              className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                meme.user_vote === 'upvote' 
                  ? 'text-cyber-green bg-cyber-green/20 border border-cyber-green/50' 
                  : 'text-gray-400 hover:text-cyber-green hover:bg-cyber-green/10'
              } ${(!canVote || isOwner) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={canVote && !isOwner ? { scale: 1.05 } : {}}
              whileTap={canVote && !isOwner ? { scale: 0.95 } : {}}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-mono text-sm">{meme.upvotes}</span>
            </motion.button>

            {/* Downvote Button */}
            <motion.button
              onClick={() => handleVote('downvote')}
              disabled={!canVote || isOwner}
              className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                meme.user_vote === 'downvote' 
                  ? 'text-cyber-pink bg-cyber-pink/20 border border-cyber-pink/50' 
                  : 'text-gray-400 hover:text-cyber-pink hover:bg-cyber-pink/10'
              } ${(!canVote || isOwner) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={canVote && !isOwner ? { scale: 1.05 } : {}}
              whileTap={canVote && !isOwner ? { scale: 0.95 } : {}}
            >
              <ThumbsDown className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Share Button */}
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 text-gray-400 
                       hover:text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-4 h-4" />
            <span className="font-mono text-sm">SHARE</span>
          </motion.button>

          {/* Bid Section */}
          {canBid && (
            <div className="flex items-center space-x-2">
              {showBidInput ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-24 bg-black/80 border border-cyber-green/50 px-2 py-1 
                               text-xs text-cyber-green font-mono focus:outline-none focus:border-cyber-green"
                    placeholder="Amount"
                    min={meme.price + 1}
                    disabled={bidLoading}
                  />
                  <motion.button
                    onClick={handleBid}
                    disabled={bidLoading}
                    className="bg-cyber-green/20 text-cyber-green border border-cyber-green/50 
                               px-3 py-1 text-xs font-orbitron font-bold hover:bg-cyber-green/30 
                               transition-all duration-300 disabled:opacity-50"
                    whileHover={!bidLoading ? { scale: 1.05 } : {}}
                    whileTap={!bidLoading ? { scale: 0.95 } : {}}
                  >
                    {bidLoading ? (
                      <Zap className="w-3 h-3 animate-spin" />
                    ) : (
                      'BID'
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowBidInput(false)}
                    disabled={bidLoading}
                    className="text-gray-400 hover:text-cyber-pink transition-colors duration-300
                               disabled:opacity-50"
                    whileHover={!bidLoading ? { scale: 1.05 } : {}}
                    whileTap={!bidLoading ? { scale: 0.95 } : {}}
                  >
                    ✕
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowBidInput(true)}
                  className="bg-cyber-green/20 text-cyber-green border border-cyber-green/50 
                             px-4 py-2 font-orbitron text-xs font-bold hover:bg-cyber-green/30 
                             transition-all duration-300 neon-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  BID
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Vote Status for User */}
        {meme.user_vote && (
          <div className="text-center">
            <span className={`text-xs font-orbitron px-2 py-1 rounded ${
              meme.user_vote === 'upvote' 
                ? 'bg-cyber-green/20 text-cyber-green' 
                : 'bg-cyber-pink/20 text-cyber-pink'
            }`}>
              YOU {meme.user_vote.toUpperCase()}D THIS
            </span>
          </div>
        )}

        {/* Owner can't vote message */}
        {isOwner && (
          <div className="text-center">
            <span className="text-xs font-orbitron px-2 py-1 rounded bg-gray-600/20 text-gray-400">
              YOU CAN'T VOTE ON YOUR OWN MEME
            </span>
          </div>
        )}

        {/* Not logged in message */}
        {!isAuthenticated && (
          <div className="text-center">
            <span className="text-xs font-orbitron px-2 py-1 rounded bg-cyber-blue/20 text-cyber-blue">
              LOGIN TO VOTE & BID
            </span>
          </div>
        )}
      </div>

      {/* Scanline effect */}
      <div className="scanline" />
    </motion.div>
  );
};

export default MemeCard;