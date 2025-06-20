import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Crown, Star, Award } from 'lucide-react';
import { useMemes } from '../context/MemeContext';

const Leaderboard: React.FC = () => {
  const { getLeaderboard } = useMemes();
  const topMemes = getLeaderboard(10);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1: return <Award className="w-6 h-6 text-gray-400" />;
      case 2: return <Star className="w-6 h-6 text-orange-400" />;
      default: return <Trophy className="w-5 h-5 text-cyber-blue" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'border-yellow-400/50 bg-yellow-400/10';
      case 1: return 'border-gray-400/50 bg-gray-400/10';
      case 2: return 'border-orange-400/50 bg-orange-400/10';
      default: return 'border-cyber-blue/30 bg-cyber-blue/5';
    }
  };

  return (
    <motion.div
      className="bg-black/80 border border-cyber-pink/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-orbitron text-cyber-pink mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2" />
        MEME LEADERBOARD
        <div className="ml-auto w-2 h-2 bg-cyber-pink rounded-full animate-pulse" />
      </h3>

      <div className="space-y-3">
        {topMemes.map((meme, index) => (
          <motion.div
            key={meme.id}
            className={`flex items-center justify-between p-4 border transition-all duration-300 group hover:scale-102 ${getRankColor(index)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10">
                {getRankIcon(index)}
              </div>
              
              <div className="flex items-center space-x-3">
                <img
                  src={meme.image_url}
                  alt={meme.title}
                  className="w-12 h-12 object-cover border border-gray-600 group-hover:border-cyber-pink/50 transition-colors"
                />
                
                <div>
                  <div className="font-orbitron text-cyan-400 text-sm group-hover:text-cyber-pink transition-colors">
                    {meme.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    by {meme.owner?.username || 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyber-green" />
                <span className="font-mono text-cyber-green font-bold">
                  {meme.upvotes.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {meme.price} CR
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-cyber-blue font-orbitron font-bold text-lg">
              {topMemes.reduce((sum, meme) => sum + meme.upvotes, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">TOTAL VOTES</div>
          </div>
          <div>
            <div className="text-cyber-green font-orbitron font-bold text-lg">
              {topMemes.reduce((sum, meme) => sum + meme.price, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">TOTAL VALUE</div>
          </div>
          <div>
            <div className="text-cyber-pink font-orbitron font-bold text-lg">
              {topMemes.length}
            </div>
            <div className="text-xs text-gray-400">TOP MEMES</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;