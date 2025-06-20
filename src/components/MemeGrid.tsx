import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, Eye, Share2, Zap, Filter } from 'lucide-react';
import { useMemes } from '../context/MemeContext';
import MemeCard from './MemeCard';
import Leaderboard from './Leaderboard';

const MemeGrid: React.FC = () => {
  const { memes, loading } = useMemes();
  const [filter, setFilter] = useState<'all' | 'trending' | 'new' | 'top'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const filteredMemes = memes.filter(meme => {
    const matchesSearch = meme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'trending':
        return meme.upvotes > 50;
      case 'new':
        return Date.now() - new Date(meme.created_at).getTime() < 24 * 60 * 60 * 1000;
      case 'top':
        return meme.upvotes > 100;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Zap className="w-12 h-12 text-cyber-blue animate-pulse mx-auto mb-4" />
          <p className="text-cyber-blue font-orbitron">LOADING MEME DATABASE...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to the neural network...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-orbitron font-bold text-cyber-blue glitch-text mb-4" data-text="MEME GALLERY">
          MEME GALLERY
        </h1>
        <p className="text-cyan-400/80">Neural network curated digital artifacts</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="SEARCH MEMES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/80 border border-cyber-blue/50 focus:border-cyber-blue 
                       p-3 text-cyan-400 placeholder-cyan-400/50 font-orbitron 
                       focus:outline-none focus:ring-2 focus:ring-cyber-blue/20"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'trending', 'new', 'top'] as const).map((filterType) => (
            <motion.button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 font-orbitron text-sm uppercase tracking-wider border
                ${filter === filterType 
                  ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/10 neon-glow' 
                  : 'border-gray-600 text-gray-400 hover:border-cyber-blue hover:text-cyber-blue'
                } transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filterType}
            </motion.button>
          ))}
          
          <motion.button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`px-4 py-2 font-orbitron text-sm uppercase tracking-wider border
              ${showLeaderboard 
                ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/10 neon-glow' 
                : 'border-gray-600 text-gray-400 hover:border-cyber-pink hover:text-cyber-pink'
              } transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            LEADERBOARD
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Eye, label: 'Total Memes', value: memes.length, color: 'text-cyber-blue' },
          { icon: Heart, label: 'Total Likes', value: memes.reduce((sum, m) => sum + m.upvotes, 0), color: 'text-cyber-pink' },
          { icon: TrendingUp, label: 'Trending', value: filteredMemes.length, color: 'text-cyber-green' },
          { icon: Share2, label: 'Total Value', value: `${memes.reduce((sum, m) => sum + m.price, 0)}CR`, color: 'text-cyber-purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-black/60 border border-gray-600 p-4 text-center hover:border-cyan-400/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className={`text-xl font-orbitron font-bold ${stat.color}`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className="text-xs text-gray-400 uppercase">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Meme Grid */}
        <div className={`${showLeaderboard ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <AnimatePresence>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              layout
            >
              {filteredMemes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                >
                  <MemeCard meme={meme} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredMemes.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-orbitron">NO MEMES FOUND</p>
              <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </div>

        {/* Leaderboard Sidebar */}
        {showLeaderboard && (
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Leaderboard />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MemeGrid;